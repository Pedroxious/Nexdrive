import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';
import { ConfettiCanvasService } from '../../shared/animations/confetti-canvas';
import { timeout } from 'rxjs';

type OverlayPanel = 'connecting' | 'success' | 'server-error' | 'oauth-error';

/** Maximum ms to wait for any auth request before forcing the error state. */
const AUTH_TIMEOUT_MS = 10_000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">

      <!-- ═══════════════════ LEFT HERO PANEL ═══════════════════ -->
      <div class="hero-panel">
        <div class="hero-bg-effects">
          <div class="hero-grid"></div>
          <div class="hero-glow glow-1"></div>
          <div class="hero-glow glow-2"></div>
          <div class="hero-glow glow-3"></div>
        </div>

        <div class="hero-content">
          <div class="hero-brand">
            <span class="brand-logo">Nex<span class="brand-accent">drive</span></span>
          </div>

          <h2 class="hero-headline">A nova forma de<br>
            <span class="hero-gradient-text">alugar seu carro</span>
          </h2>

          <p class="hero-sub">Acesso completo ao catálogo premium. Reserve, gerencie e dirija — tudo em um só lugar.</p>

          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <strong>Reserva protegida</strong>
                <span>Cancelamento gratuito em até 24h</span>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <strong>Retirada Digital</strong>
                <span>Sem filas — direto do aplicativo</span>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65z"/></svg>
              </div>
              <div>
                <strong>+500 veículos</strong>
                <span>Frota diversificada em todo o Brasil</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-footer">
          <p>© {{ currentYear }} Nexdrive · Todos os direitos reservados</p>
        </div>
      </div>

      <!-- ═══════════════════ RIGHT FORM PANEL ═══════════════════ -->
      <div class="form-panel">
        <div class="form-panel-inner">

          <!-- Mobile-only brand -->
          <div class="mobile-brand">
            <span class="brand-logo">Nex<span class="brand-accent">drive</span></span>
          </div>

          <div class="card-wrapper" [class.card-shake]="cardShaking()">

            <!-- ══════════ OVERLAY STATE MACHINE ══════════ -->
            <div class="auth-overlay"
                 *ngIf="overlayVisible()"
                 [class.overlay-exit]="overlayExiting()">

              <div class="overlay-inner"
                   [class.panel-exit]="panelExiting()">

                <!-- CONNECTING -->
                <div class="panel-content" *ngIf="activePanel() === 'connecting'">
                  <div class="state-icon-wrap">
                    <svg class="spinner-svg" viewBox="0 0 50 50" width="52" height="52" aria-label="Carregando">
                      <circle class="spinner-track" cx="25" cy="25" r="19"/>
                      <circle class="spinner-arc"   cx="25" cy="25" r="19"/>
                    </svg>
                  </div>
                  <p class="overlay-title">Conectando à sua conta...</p>
                  <p class="overlay-sub">Verificando suas credenciais</p>
                </div>

                <!-- SUCCESS -->
                <div class="panel-content" *ngIf="activePanel() === 'success'">

                  <div class="state-icon-wrap">
                    <div class="icon-ring icon-ring-success">
                      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" aria-hidden="true">
                        <polyline class="check-path"
                                  points="4,13 9,18 20,7"
                                  stroke="white" stroke-width="2.5"
                                  stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <p class="overlay-title">{{ successTitle() }}</p>
                  <p class="overlay-sub">Redirecionando...</p>
                </div>

                <!-- SERVER ERROR -->
                <div class="panel-content" *ngIf="activePanel() === 'server-error'">
                  <div class="state-icon-wrap">
                    <div class="icon-ring icon-ring-error">
                      <svg viewBox="0 0 24 24" fill="none" width="26" height="26" aria-hidden="true">
                        <circle cx="12" cy="12" r="9.5" stroke="white" stroke-width="2"/>
                        <line x1="12" y1="8"  x2="12" y2="13" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <p class="overlay-title">{{ errorTitle() }}</p>
                  <p class="overlay-sub">{{ errorSubtitle() }}</p>
                  <button class="retry-btn" (click)="retry()">
                    <svg viewBox="0 0 24 24" fill="none" width="15" height="15" aria-hidden="true">
                      <polyline points="1,4 1,10 7,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Tentar novamente
                  </button>
                </div>

                <!-- OAUTH ERROR -->
                <div class="panel-content" *ngIf="activePanel() === 'oauth-error'">
                  <div class="state-icon-wrap">
                    <div class="icon-ring icon-ring-error">
                      <svg viewBox="0 0 24 24" fill="none" width="26" height="26" aria-hidden="true">
                        <circle cx="12" cy="12" r="9.5" stroke="white" stroke-width="2"/>
                        <path d="M9 9l6 6M15 9l-6 6" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <p class="overlay-title">{{ errorTitle() }}</p>
                  <p class="overlay-sub">{{ errorSubtitle() }}</p>
                  <button class="retry-btn" (click)="retry()">
                    <svg viewBox="0 0 24 24" fill="none" width="15" height="15" aria-hidden="true">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Continuar com o Google
                  </button>
                  <button class="cancel-link" (click)="dismissOverlay()">Usar e-mail e senha</button>
                </div>
              </div><!-- /overlay-inner -->
            </div><!-- /auth-overlay -->

            <!-- ══════════ FORM CONTENT ══════════ -->
            <div class="form-header">
              <h1>Bem-vindo de volta</h1>
              <p>Acesse sua conta para gerenciar reservas e veículos</p>
            </div>

            <!-- Social Login (above form for prominence) -->
            <button type="button"
                    class="google-btn"
                    [disabled]="overlayVisible()"
                    (click)="loginWithGoogle()">
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12.07 5c1.73 0 3.3.6 4.53 1.59l3.37-3.37C17.86 1.38 15.14 0 12.07 0 7.37 0 3.37 2.69 1.28 6.6l3.99 3.16z"/>
                <path fill="#34A853" d="M12.07 24c3.03 0 5.57-1 7.43-2.73l-3.63-2.8c-1.02.67-2.33 1.08-3.8 1.08A7.06 7.06 0 0 1 5.3 14.3L1.3 17.45C3.38 21.34 7.38 24 12.07 24z"/>
                <path fill="#4A90D9" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27h-11.23v4.51h6.47a5.5 5.5 0 0 1-2.4 3.6l3.63 2.8c2.12-1.95 3.72-4.83 3.72-8.64z"/>
                <path fill="#FBBC05" d="M5.3 14.3a7.22 7.22 0 0 1 0-4.54L1.3 6.6A12.06 12.06 0 0 0 0 12c0 1.95.47 3.77 1.28 5.45L5.3 14.3z"/>
              </svg>
              <span>Continuar com o Google</span>
            </button>

            <div class="divider"><span>ou entre com e-mail</span></div>

            <form (ngSubmit)="onLogin()" #loginForm="ngForm" novalidate>

              <!-- E-mail field -->
              <div class="field-group" [class.field-error]="emailTouched && emailError()"
                   [class.field-valid]="emailTouched && !emailError() && email.length > 0"
                   [class.field-focus]="emailFocused">
                <label for="email-input">E-mail</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="email-input"
                    type="email"
                    [ngModel]="email"
                    (ngModelChange)="onEmailInput($event)"
                    name="email"
                    placeholder="seu@email.com"
                    required
                    maxlength="255"
                    autocomplete="email"
                    class="form-input"
                    (focus)="emailFocused = true"
                    (blur)="emailFocused = false; emailTouched = true"
                  >
                  <!-- Real-time validation icon -->
                  <svg *ngIf="emailTouched && !emailError() && email.length > 0" class="validation-icon valid" viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="12" r="10" fill="#10B981"/>
                    <polyline points="8,12 11,15 16,9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg *ngIf="emailTouched && emailError()" class="validation-icon invalid" viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="12" r="10" fill="#EF4444"/>
                    <path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="field-error-slot">
                  <span class="field-message" *ngIf="emailTouched && emailError()">{{ emailError() }}</span>
                </div>
              </div>

              <!-- Password field -->
              <div class="field-group" [class.field-error]="passwordTouched && passwordError()"
                   [class.field-valid]="passwordTouched && !passwordError() && password.length > 0"
                   [class.field-focus]="passwordFocused">
                <div class="label-row">
                  <label for="password-input">Senha</label>
                  <a class="forgot-link" tabindex="0">Esqueceu a senha?</a>
                </div>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="password-input"
                    [type]="showPassword ? 'text' : 'password'"
                    [ngModel]="password"
                    (ngModelChange)="onPasswordInput($event)"
                    name="password"
                    placeholder="••••••••"
                    required
                    maxlength="100"
                    autocomplete="current-password"
                    class="form-input"
                    (focus)="passwordFocused = true"
                    (blur)="passwordFocused = false; passwordTouched = true"
                  >
                  <!-- Toggle password visibility -->
                  <button type="button" class="toggle-password" (click)="showPassword = !showPassword" tabindex="-1" aria-label="Mostrar senha">
                    <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <div class="field-error-slot">
                  <span class="field-message" *ngIf="passwordTouched && passwordError()">{{ passwordError() }}</span>
                </div>
              </div>

              <!-- Inline credential error -->
              <div class="inline-error" *ngIf="credentialError()" role="alert">
                <svg viewBox="0 0 16 16" fill="none" width="15" height="15" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" stroke-width="1.5"/>
                  <path d="M8 5v3.5M8 10.5h.01" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ credentialError() }}
              </div>

              <!-- Remember me -->
              <div class="remember-row">
                <label class="remember-label">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
                  <span class="custom-checkbox">
                    <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                      <polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span class="remember-text">Manter conectado</span>
                </label>
              </div>

              <!-- Submit button -->
              <button type="submit"
                      class="submit-btn"
                      [class.btn-loading]="overlayVisible() && activePanel() === 'connecting'"
                      [disabled]="overlayVisible() || !isFormValid()">
                <span class="btn-text" *ngIf="!overlayVisible()">Entrar na minha conta</span>
                <span class="btn-text" *ngIf="overlayVisible()">
                  <svg class="btn-spinner" viewBox="0 0 24 24" width="20" height="20">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.25"/>
                    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                  </svg>
                  Entrando...
                </span>
              </button>
            </form>

            <div class="signup-footer">
              <p>Ainda não tem uma conta? <a routerLink="/register">Criar conta gratuitamente</a></p>
            </div>

          </div><!-- /card-wrapper -->

          <!-- Trust indicators below card -->
          <div class="trust-indicators">
            <div class="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Conexão segura</span>
            </div>
            <div class="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Dados criptografados</span>
            </div>
          </div>

        </div><!-- /form-panel-inner -->
      </div><!-- /form-panel -->

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════════════
       PREMIUM LOGIN PAGE — Split Layout with Hero Panel
       NexDrive Design System: Navy + Electric Cyan
       ═══════════════════════════════════════════════════════════════ */

    /* ── PAGE LAYOUT ── */
    .login-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: calc(100vh - var(--navbar-height));
      background: var(--bg-main);
    }

    /* ═══════ HERO PANEL (LEFT) ═══════ */
    .hero-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 48px;
      background: var(--bg-navbar);
      overflow: hidden;
    }

    .hero-bg-effects {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(0, 191, 234, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 191, 234, 0.04) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%);
    }

    .hero-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      animation: glowPulse 6s ease-in-out infinite alternate;
    }
    .glow-1 {
      width: 340px; height: 340px;
      background: rgba(0, 191, 234, 0.15);
      top: 15%; left: -5%;
    }
    .glow-2 {
      width: 260px; height: 260px;
      background: rgba(26, 58, 107, 0.25);
      bottom: 20%; right: 5%;
      animation-delay: -3s;
    }
    .glow-3 {
      width: 180px; height: 180px;
      background: rgba(0, 191, 234, 0.08);
      top: 60%; left: 40%;
      animation-delay: -1.5s;
    }

    @keyframes glowPulse {
      0%   { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.15); opacity: 0.6; }
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    .hero-brand {
      margin-bottom: 24px;
    }

    .brand-logo {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
    }
    .brand-accent {
      color: var(--accent);
    }

    .hero-headline {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      line-height: 1.2;
      color: #fff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .hero-gradient-text {
      background: linear-gradient(135deg, var(--accent), #4DD0E1, #00E5FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.5;
      max-width: 440px;
      margin-bottom: 24px;
    }

    .hero-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-feature {
      display: flex;
      align-items: center;
      gap: 16px;

      .feature-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: rgba(0, 191, 234, 0.1);
        border: 1px solid rgba(0, 191, 234, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--accent);
        transition: all 0.3s;
      }

      strong {
        display: block;
        font-family: 'Outfit', sans-serif;
        font-size: 14.5px;
        font-weight: 700;
        color: #fff;
      }

      span {
        display: block;
        font-family: 'Inter', sans-serif;
        font-size: 12.5px;
        color: rgba(255, 255, 255, 0.42);
        margin-top: 2px;
      }
    }

    .hero-footer {
      position: absolute;
      bottom: 24px;
      left: 48px;

      p {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.2);
      }
    }

    /* ═══════ FORM PANEL (RIGHT) ═══════ */
    .form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 40px;
      background: var(--bg-main);
      overflow-y: auto;
    }

    .form-panel-inner {
      width: 100%;
      max-width: 440px;
    }

    .mobile-brand {
      display: none;
      text-align: center;
      margin-bottom: 32px;
    }

    .card-wrapper {
      position: relative;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 28px 32px 24px;
      box-shadow:
        var(--shadow-lg),
        0 0 0 1px rgba(0, 191, 234, 0.03);
      animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow:
          var(--shadow-xl),
          0 0 0 1px rgba(0, 191, 234, 0.06);
      }
    }

    .card-wrapper.card-shake {
      animation: cardShake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes cardShake {
      0%,  100% { transform: translateX(0); }
      15%        { transform: translateX(-8px); }
      30%        { transform: translateX(7px); }
      45%        { transform: translateX(-6px); }
      60%        { transform: translateX(4px); }
      75%        { transform: translateX(-2px); }
      90%        { transform: translateX(1px); }
    }

    /* ═══════ OVERLAY STATE MACHINE ═══════ */
    .auth-overlay {
      position: absolute;
      inset: 0;
      z-index: 20;
      background: rgba(10, 14, 26, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: overlayIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .auth-overlay.overlay-exit {
      animation: overlayOut 0.22s ease-in forwards;
    }

    @keyframes overlayIn {
      from { opacity: 0; transform: scale(0.97); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes overlayOut {
      from { opacity: 1; transform: scale(1); }
      to   { opacity: 0; transform: scale(0.97); }
    }

    .overlay-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 0 32px;
    }

    .overlay-inner.panel-exit {
      animation: panelOut 0.2s ease-in forwards;
    }

    @keyframes panelOut {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(-10px); }
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
      animation: panelIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes panelIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .state-icon-wrap {
      width: 76px;
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-ring {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-ring-success {
      background: rgba(16, 185, 129, 0.18);
      border: 2px solid rgba(16, 185, 129, 0.45);
      animation: ringBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      box-shadow: 0 0 40px rgba(16, 185, 129, 0.2);
    }



    .icon-ring-error {
      background: rgba(239, 68, 68, 0.15);
      border: 2px solid rgba(239, 68, 68, 0.4);
      animation: ringError 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
    }

    @keyframes ringBounce {
      0%   { transform: scale(0); opacity: 0; }
      55%  { transform: scale(1.18); opacity: 1; }
      75%  { transform: scale(0.92); }
      100% { transform: scale(1); }
    }

    @keyframes ringError {
      0%,  100% { transform: translateX(0); }
      20%        { transform: translateX(-6px); }
      40%        { transform: translateX(6px); }
      60%        { transform: translateX(-4px); }
      80%        { transform: translateX(3px); }
    }

    .spinner-svg {
      display: block;
      animation: spinSvg 0.9s linear infinite;
      transform-origin: center;
      filter: drop-shadow(0 0 10px rgba(0, 191, 234, 0.5));
    }

    .spinner-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.08);
      stroke-width: 3.5;
    }

    .spinner-arc {
      fill: none;
      stroke: var(--accent);
      stroke-width: 3.5;
      stroke-linecap: round;
      stroke-dasharray: 80 40;
    }

    @keyframes spinSvg { to { transform: rotate(360deg); } }

    .check-path {
      stroke-dasharray: 26;
      stroke-dashoffset: 26;
      animation: drawCheck 0.48s cubic-bezier(0.65, 0, 0.45, 1) 0.18s forwards;
    }

    @keyframes drawCheck { to { stroke-dashoffset: 0; } }

    .overlay-title {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      letter-spacing: -0.2px;
    }

    .overlay-sub {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    .retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 11px 24px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.18);
        border-color: rgba(255, 255, 255, 0.35);
        transform: translateY(-1px);
      }
      &:active { transform: translateY(0); }
    }

    .cancel-link {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.38);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      margin-top: 4px;
      transition: color 0.2s;
      &:hover { color: rgba(255, 255, 255, 0.7); }
    }

    /* ═══════ FORM HEADER ═══════ */
    .form-header {
      margin-bottom: 20px;
      text-align: center;

      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 24px;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 4px;
        letter-spacing: -0.3px;
      }
      p {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.4;
      }
    }

    /* ═══════ GOOGLE BUTTON ═══════ */
    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 10px 20px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      .google-icon { flex-shrink: 0; }

      &:hover:not(:disabled) {
        background: var(--surface-secondary);
        border-color: var(--text-muted);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* ═══════ DIVIDER ═══════ */
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 16px 0;
      color: var(--text-muted);
      font-size: 11.5px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border);
      }
      span { padding: 0 12px; }
    }

    /* ═══════ FORM FIELDS ═══════ */
    .field-group {
      margin-bottom: 14px;
      text-align: left;
      transition: all 0.2s;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-secondary);
      transition: color 0.2s;
    }

    .field-group.field-focus label {
      color: var(--accent);
    }

    .field-group.field-error label {
      color: var(--error);
    }

    .field-group.field-valid label {
      color: var(--success);
    }

    .forgot-link {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: var(--accent);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      background: none;
      padding: 0;

      &:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted);
      pointer-events: none;
      transition: color 0.2s;
      z-index: 1;
    }

    .field-group.field-focus .input-icon {
      color: var(--accent);
    }

    .field-group.field-error .input-icon {
      color: var(--error);
    }

    .field-group.field-valid .input-icon {
      color: var(--success);
    }

    .form-input {
      width: 100%;
      padding: 10px 40px 10px 40px;
      background: var(--surface-secondary);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      outline: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &::placeholder {
        color: var(--text-muted);
        font-weight: 400;
      }

      &:focus {
        border-color: var(--accent);
        background: var(--surface);
        box-shadow: 0 0 0 3px var(--accent-light), var(--shadow-sm);
      }
    }

    .field-group.field-error .form-input {
      border-color: var(--error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);

      &:focus {
        border-color: var(--error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
      }
    }

    .field-group.field-valid .form-input {
      border-color: var(--success);

      &:focus {
        border-color: var(--success);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    }

    .validation-icon {
      position: absolute;
      right: 14px;
      pointer-events: none;
      animation: iconPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes iconPop {
      from { opacity: 0; transform: scale(0.6); }
      to   { opacity: 1; transform: scale(1); }
    }

    .toggle-password {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      z-index: 2;

      &:hover { color: var(--text-primary); }
    }

    .field-error-slot {
      min-height: 18px;
      margin-top: 3px;
    }

    .field-message {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--error);
      padding-left: 2px;
      animation: panelIn 0.2s ease-out;
    }

    /* ═══════ INLINE ERROR ═══════ */
    .inline-error {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 14px;
      padding: 10px 14px;
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.18);
      border-radius: var(--radius-md);
      color: var(--error);
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      text-align: left;
      animation: panelIn 0.22s ease-out forwards;
    }

    /* ═══════ REMEMBER ME ═══════ */
    .remember-row {
      margin-bottom: 16px;
    }

    .remember-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      color: var(--text-secondary);
      user-select: none;
      margin: 0;

      input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
    }

    .custom-checkbox {
      width: 17px;
      height: 17px;
      border: 1.5px solid var(--border);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface);
      transition: all 0.2s;
      flex-shrink: 0;

      svg { opacity: 0; transition: opacity 0.15s; }
    }

    input[type="checkbox"]:checked + .custom-checkbox {
      background: var(--accent);
      border-color: var(--accent);

      svg { opacity: 1; }
    }

    input[type="checkbox"]:focus-visible + .custom-checkbox {
      box-shadow: 0 0 0 3px var(--accent-light);
    }

    .remember-text {
      font-weight: 500;
    }

    /* ═══════ SUBMIT BUTTON ═══════ */
    .submit-btn {
      width: 100%;
      padding: 11px 24px;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 14.5px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      .btn-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      &:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-accent);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: none;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      &.btn-loading {
        opacity: 0.8;
      }
    }

    .btn-spinner {
      animation: spinSvg 0.8s linear infinite;
    }

    /* ═══════ SIGN-UP FOOTER ═══════ */
    .signup-footer {
      margin-top: 18px;
      text-align: center;

      p {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--text-secondary);
      }
      a {
        color: var(--accent);
        font-weight: 700;
        text-decoration: none;
        transition: all 0.2s;

        &:hover {
          color: var(--accent-hover);
          text-decoration: underline;
        }
      }
    }

    /* ═══════ TRUST INDICATORS ═══════ */
    .trust-indicators {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 18px;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 11.5px;
      color: var(--text-muted);
      font-weight: 500;

      svg { color: var(--text-muted); }
    }

    /* ═══════ RESPONSIVE ═══════ */
    @media (max-width: 1024px) {
      .login-page {
        grid-template-columns: 1fr;
      }
      .hero-panel {
        display: none;
      }
      .form-panel {
        padding: 40px 24px;
      }
      .mobile-brand {
        display: block;
      }
    }

    @media (max-width: 480px) {
      .form-panel {
        padding: 24px 16px;
      }
      .card-wrapper {
        padding: 32px 24px 28px;
        border-radius: var(--radius-lg);
      }
      .form-header h1 {
        font-size: 22px;
      }
      .trust-indicators {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  email    = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  // Field interaction state
  emailFocused    = false;
  emailTouched    = false;
  passwordFocused = false;
  passwordTouched = false;

  // Real-time validation signals
  emailError    = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  // ── State machine signals ────────────────────────────────────────────────────
  overlayVisible  = signal(false);
  overlayExiting  = signal(false);
  panelExiting    = signal(false);
  activePanel     = signal<OverlayPanel>('connecting');

  credentialError = signal<string | null>(null);
  inputsHaveError = signal(false);
  cardShaking     = signal(false);

  private retryAction    = signal<(() => void) | null>(null);
  private oauthErrorCode = signal<string>('auth_failed');

  // ── Dependencies ─────────────────────────────────────────────────────────────────────
  private auth     = inject(AuthService);
  private toast    = inject(ToastService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);
  private confetti = inject(ConfettiCanvasService);

  currentYear = new Date().getFullYear();

  /**
   * V-08 fix: whitelist of safe OAuth error codes from the backend failure handler.
   */
  private readonly oauthErrors: Record<string, string> = {
    no_email:      'Não foi possível obter seu e-mail do Google. Verifique as permissões.',
    access_denied: 'Acesso negado pelo provedor. Tente novamente.',
    invalid_token: 'Token de autenticação inválido. Tente novamente.',
    auth_failed:   'Falha na autenticação com o Google.',
  };

  // ── Computed UI strings ───────────────────────────────────────────────────────
  readonly successTitle = computed(() => {
    const firstName = this.auth.currentUser()?.fullName?.split(' ')[0];
    return firstName ? `Bem-vindo de volta, ${firstName}!` : 'Bem-vindo de volta!';
  });

  readonly errorTitle = computed(() =>
    this.activePanel() === 'oauth-error'
      ? 'Não foi possível continuar com o Google'
      : 'Servidor temporariamente indisponível'
  );

  readonly errorSubtitle = computed(() =>
    this.activePanel() === 'oauth-error'
      ? (this.oauthErrors[this.oauthErrorCode()] ?? this.oauthErrors['auth_failed'])
      : 'Pode ser uma instabilidade temporária. Tente novamente em instantes.'
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const oauth2    = params['oauth2'];
      const errorCode = params['error'];

      if (errorCode) {
        const safeCode = errorCode in this.oauthErrors ? errorCode : 'auth_failed';
        this.oauthErrorCode.set(safeCode);
        this.activePanel.set('oauth-error');
        this.overlayVisible.set(true);
        this.retryAction.set(() => window.location.replace('/oauth2/authorization/google'));
        return;
      }

      if (oauth2 === 'success') {
        this.activePanel.set('connecting');
        this.overlayVisible.set(true);
        this.loadOAuthSession();
      }
    });
  }

  // ── Real-time input sanitization & validation ─────────────────────────────────
  onEmailInput(value: string) {
    this.email = value.replace(/\s/g, '').slice(0, 255);
    this.clearCredentialError();
    this.validateEmail();
  }

  onPasswordInput(value: string) {
    this.password = value.slice(0, 100);
    this.clearCredentialError();
    this.validatePassword();
  }

  validateEmail() {
    if (!this.email) {
      this.emailError.set('E-mail é obrigatório');
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
      this.emailError.set('Formato de e-mail inválido');
    } else {
      this.emailError.set(null);
    }
  }

  validatePassword() {
    if (!this.password) {
      this.passwordError.set('Senha é obrigatória');
    } else if (this.password.length < 8) {
      this.passwordError.set('Mínimo de 8 caracteres');
    } else {
      this.passwordError.set(null);
    }
  }

  isFormValid(): boolean {
    return this.email.length > 0
        && this.password.length > 0
        && !this.emailError()
        && !this.passwordError();
  }

  // ── Public actions ─────────────────────────────────────────────────────────
  onLogin() {
    this.emailTouched = true;
    this.passwordTouched = true;
    this.validateEmail();
    this.validatePassword();

    if (!this.isFormValid()) return;

    this.clearCredentialError();
    this.retryAction.set(() => this.onLogin());
    this.showOverlay('connecting');

    this.auth.login({ email: this.email, password: this.password })
      .pipe(timeout(AUTH_TIMEOUT_MS))
      .subscribe({
        next:  () => this.handleSuccess(),
        error: (err) => this.handleLoginError(err),
      });
  }

  loginWithGoogle() {
    this.showOverlay('connecting');
    setTimeout(() => window.location.replace('/oauth2/authorization/google'), 300);
  }

  retry() {
    const action = this.retryAction();
    if (action) action();
  }

  dismissOverlay() {
    this.hideOverlay();
  }

  clearCredentialError() {
    this.credentialError.set(null);
    this.inputsHaveError.set(false);
  }

  // ── Private: state transitions ────────────────────────────────────────────
  private loadOAuthSession() {
    this.retryAction.set(() => {
      this.transitionToPanel('connecting');
      this.loadOAuthSession();
    });

    this.auth.getMe()
      .pipe(timeout(AUTH_TIMEOUT_MS))
      .subscribe({
        next:  () => this.handleSuccess(),
        error: () => this.transitionToPanel('oauth-error'),
      });
  }

  private handleSuccess() {
    this.transitionToPanel('success');

    // Launch fullscreen Canvas confetti celebration
    this.confetti.launch(3000);

    // Check for pending rental wizard state
    const pendingState = sessionStorage.getItem('pending_rental_wizard_state');

    setTimeout(() => {
      this.toast.success('Login realizado com sucesso!');
      if (pendingState) {
        try {
          const state = JSON.parse(pendingState);
          if (state.url) {
            this.confetti.destroy();
            this.router.navigateByUrl(state.url);
            return;
          }
        } catch {}
      }
      this.confetti.destroy();
      this.router.navigate(['/']);
    }, 1800);
  }

  private handleLoginError(err: any) {
    const isTimeout      = err?.name === 'TimeoutError' || err?.code === 'ETIMEDOUT';
    const isNetworkError = err?.status === 0;
    const isServerError  = err?.status >= 500;

    if (isTimeout || isNetworkError || isServerError) {
      this.transitionToPanel('server-error');
    } else if (err?.status === 429) {
      this.dismissAndShowCredentialError('Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
    } else {
      this.dismissAndShowCredentialError('E-mail ou senha incorretos.');
    }
  }

  private showOverlay(panel: OverlayPanel) {
    this.activePanel.set(panel);
    this.overlayVisible.set(true);
  }

  private transitionToPanel(panel: OverlayPanel) {
    if (!this.overlayVisible()) {
      this.showOverlay(panel);
      return;
    }
    this.panelExiting.set(true);
    setTimeout(() => {
      this.panelExiting.set(false);
      this.activePanel.set(panel);
    }, 200);
  }

  private hideOverlay() {
    if (!this.overlayVisible()) return;
    this.overlayExiting.set(true);
    setTimeout(() => {
      this.overlayExiting.set(false);
      this.overlayVisible.set(false);
    }, 240);
  }

  private dismissAndShowCredentialError(message: string) {
    this.overlayExiting.set(true);
    setTimeout(() => {
      this.overlayExiting.set(false);
      this.overlayVisible.set(false);
      this.credentialError.set(message);
      this.inputsHaveError.set(true);
      this.cardShaking.set(true);
      setTimeout(() => this.cardShaking.set(false), 600);
    }, 220);
  }
}
