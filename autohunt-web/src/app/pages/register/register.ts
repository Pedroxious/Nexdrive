import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';
import { RegisterStep1Component } from './register-step1';
import { RegisterVerifyEmailComponent } from './register-verify-email';
import { RegisterAdditionalInfoComponent } from './register-additional-info';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RegisterStep1Component,
    RegisterVerifyEmailComponent,
    RegisterAdditionalInfoComponent
  ],
  template: `
    <div class="register-page">

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

          <h2 class="hero-headline">Sua jornada<br>
            <span class="hero-gradient-text">começa aqui</span>
          </h2>

          <p class="hero-sub">Crie sua conta gratuita e tenha acesso ao maior catálogo de veículos premium do Brasil.</p>

          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div>
                <strong>Cadastro rápido</strong>
                <span>Menos de 2 minutos para começar</span>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div>
                <strong>Sem cartão de crédito</strong>
                <span>Pague somente ao confirmar a reserva</span>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <strong>100% seguro</strong>
                <span>Seus dados protegidos com criptografia</span>
              </div>
            </div>
          </div>

          <!-- Social proof -->
          <div class="social-proof">
            <div class="avatars">
              <div class="avatar" style="background: #3B82F6;">P</div>
              <div class="avatar" style="background: #10B981;">M</div>
              <div class="avatar" style="background: #F59E0B;">A</div>
              <div class="avatar" style="background: #EF4444;">R</div>
              <div class="avatar" style="background: #8B5CF6;">L</div>
            </div>
            <p><strong>+2.500</strong> pessoas já se cadastraram este mês</p>
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

          <!-- Step 1: Basic Info + Password -->
          @if (currentStep() === 'step1') {
            <app-register-step1 (next)="onStep1Next($event)"></app-register-step1>
          }

          <!-- Step 2: Email Verification -->
          @if (currentStep() === 'verify-email') {
            <app-register-verify-email
              [email]="tempUser.email"
              (confirm)="onVerifyEmailConfirm($event)"
              (back)="onVerifyEmailBack()"
            ></app-register-verify-email>
          }

          <!-- Step 3: Additional Info (CPF) -->
          @if (currentStep() === 'additional-info') {
            <app-register-additional-info (finish)="onAdditionalInfoFinish($event)"></app-register-additional-info>
          }

          <!-- Trust indicators -->
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

        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════════════
       PREMIUM REGISTER PAGE — Split Layout with Hero Panel
       ═══════════════════════════════════════════════════════════════ */

    .register-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      background: var(--bg-main);
    }

    /* ═══════ HERO PANEL ═══════ */
    .hero-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 56px;
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
    .glow-1 { width: 340px; height: 340px; background: rgba(0, 191, 234, 0.15); top: 15%; left: -5%; }
    .glow-2 { width: 260px; height: 260px; background: rgba(26, 58, 107, 0.25); bottom: 20%; right: 5%; animation-delay: -3s; }
    .glow-3 { width: 180px; height: 180px; background: rgba(0, 191, 234, 0.08); top: 60%; left: 40%; animation-delay: -1.5s; }

    @keyframes glowPulse {
      0%   { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.15); opacity: 0.6; }
    }

    .hero-content { position: relative; z-index: 2; }

    .hero-brand { margin-bottom: 48px; }

    .brand-logo {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
    }
    .brand-accent { color: var(--accent); }

    .hero-headline {
      font-family: 'Outfit', sans-serif;
      font-size: 38px;
      font-weight: 800;
      line-height: 1.2;
      color: #fff;
      margin-bottom: 18px;
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
      font-size: 16px;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.6;
      max-width: 440px;
      margin-bottom: 44px;
    }

    .hero-features {
      display: flex;
      flex-direction: column;
      gap: 22px;
      margin-bottom: 48px;
    }

    .hero-feature {
      display: flex;
      align-items: center;
      gap: 16px;

      .feature-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(0, 191, 234, 0.1);
        border: 1px solid rgba(0, 191, 234, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--accent);
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

    /* Social Proof */
    .social-proof {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);

      p {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);

        strong {
          color: var(--accent);
          font-weight: 700;
        }
      }
    }

    .avatars {
      display: flex;
      flex-shrink: 0;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: white;
      border: 2px solid var(--bg-navbar);
      margin-left: -8px;

      &:first-child { margin-left: 0; }
    }

    .hero-footer {
      position: absolute;
      bottom: 32px;
      left: 56px;

      p {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.2);
      }
    }

    /* ═══════ FORM PANEL ═══════ */
    .form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 48px;
      background: var(--bg-main);
      overflow-y: auto;
    }

    .form-panel-inner {
      width: 100%;
      max-width: 480px;
    }

    .mobile-brand {
      display: none;
      text-align: center;
      margin-bottom: 28px;
    }

    /* ═══════ TRUST INDICATORS ═══════ */
    .trust-indicators {
      display: flex;
      justify-content: center;
      gap: 28px;
      margin-top: 24px;
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
      .register-page {
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
      .trust-indicators {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }
  `]
})
export class RegisterComponent {
  currentStep = signal<'step1' | 'verify-email' | 'additional-info'>('step1');

  tempUser: any = {
    fullName: '',
    phone: '',
    email: '',
    password: ''
  };

  currentYear = new Date().getFullYear();

  private auth   = inject(AuthService);
  private toast  = inject(ToastService);
  private router = inject(Router);

  onStep1Next(data: any) {
    this.tempUser = { ...data };
    // In a real app, this would send the verification email via backend.
    // For now, proceed to verification step.
    this.currentStep.set('verify-email');
  }

  onVerifyEmailBack() {
    this.currentStep.set('step1');
  }

  onVerifyEmailConfirm(code: string) {
    // In production, verify the code with the backend before proceeding.
    // For now, proceed to the additional info step.
    this.currentStep.set('additional-info');
  }

  onAdditionalInfoFinish(cpf: string | null) {
    if (cpf) {
      this.tempUser.cpf = cpf;
    }

    // Register user with the backend
    this.auth.register({
      fullName: this.tempUser.fullName,
      email: this.tempUser.email,
      password: this.tempUser.password,
      phone: this.tempUser.phone || undefined,
      cpf: this.tempUser.cpf || undefined,
    }).pipe(timeout(10_000)).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso! Bem-vindo à Nexdrive.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err?.status === 409 || err?.error?.message?.includes('cadastro')) {
          this.toast.error('Este e-mail já está cadastrado. Tente fazer login.');
        } else if (err?.status === 429) {
          this.toast.error('Muitas tentativas. Aguarde alguns minutos.');
        } else {
          this.toast.error('Erro ao criar conta. Tente novamente.');
        }
      }
    });
  }
}
