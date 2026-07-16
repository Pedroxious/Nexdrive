import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';
import { timeout } from 'rxjs';

type OverlayPanel = 'connecting' | 'success' | 'server-error' | 'oauth-error';

/** Maximum ms to wait for any auth request before forcing the error state. */
const AUTH_TIMEOUT_MS = 10_000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card animate-in"
           [class.card-shake]="cardShaking()">

        <!-- ════════════════════════════════════════════════════════
             AUTH STATE OVERLAY
             Shown for: connecting | success | server-error | oauth-error
             Hidden for: idle (overlayVisible = false)
             Exit: overlay-exit class triggers fadeOut animation before
                   *ngIf removes the element so there is no abrupt cut.
             ════════════════════════════════════════════════════════ -->
        <div class="auth-overlay"
             *ngIf="overlayVisible()"
             [class.overlay-exit]="overlayExiting()">

          <!-- Inner wrapper handles the cross-fade between panels.
               When panelExiting = true → exit animation slides content up & out.
               Each panel-content div carries its own panelIn entry animation
               so it slides in from below whenever it is rendered. -->
          <div class="overlay-inner"
               [class.panel-exit]="panelExiting()">

            <!-- ── CONNECTING ─────────────────────────────────── -->
            <div class="panel-content" *ngIf="activePanel() === 'connecting'">
              <div class="state-icon-wrap">
                <svg class="spinner-svg" viewBox="0 0 50 50" width="48" height="48" aria-label="Carregando">
                  <circle class="spinner-track" cx="25" cy="25" r="19"/>
                  <circle class="spinner-arc"   cx="25" cy="25" r="19"/>
                </svg>
              </div>
              <p class="overlay-title">Conectando à sua conta...</p>
              <p class="overlay-sub">Verificando suas credenciais</p>
            </div>

            <!-- ── SUCCESS ────────────────────────────────────── -->
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

            <!-- ── SERVER ERROR ───────────────────────────────── -->
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

            <!-- ── OAUTH ERROR ─────────────────────────────────── -->
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

        <!-- ════════════════════════════════════════════════════════
             FORM CONTENT (always in DOM — overlay sits on top)
             ════════════════════════════════════════════════════════ -->
        <div class="logo-wrapper">
          <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
        </div>

        <div class="auth-header">
          <h1>Bem-vindo de volta</h1>
          <p>Insira suas credenciais para acessar sua conta</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="input-group">
            <label for="email-input">E-mail</label>
            <input
              id="email-input"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              required
              autocomplete="email"
              class="form-input"
              [class.input-error]="inputsHaveError()"
              (input)="clearCredentialError()"
            >
          </div>

          <div class="input-group">
            <div class="label-row">
              <label for="password-input">Senha</label>
              <a class="forgot">Esqueceu a senha?</a>
            </div>
            <input
              id="password-input"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
              class="form-input"
              [class.input-error]="inputsHaveError()"
              (input)="clearCredentialError()"
            >
          </div>

          <!-- Inline credential error — replaces toast for wrong password/email -->
          <div class="inline-error" *ngIf="credentialError()" role="alert">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="#f87171" stroke-width="1.5"/>
              <path d="M8 5v3M8 10.5h.01" stroke="#f87171" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ credentialError() }}
          </div>

          <button type="submit"
                  class="auth-btn"
                  [disabled]="overlayVisible() || !loginForm.valid">
            Entrar
          </button>
        </form>

        <div class="divider"><span>ou</span></div>

        <button type="button"
                class="google-btn"
                [disabled]="overlayVisible()"
                (click)="loginWithGoogle()">
          <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.79 5.79 0 0 1 8.2 12.725a5.79 5.79 0 0 1 5.79-5.79c1.498 0 2.861.565 3.905 1.485l3.059-3.059C19.1 3.561 16.735 2.5 13.99 2.5a9.725 9.725 0 0 0-9.725 9.725 9.725 9.725 0 0 0 9.725 9.725c5.73 0 9.135-4.03 9.135-9.283 0-.603-.048-1.066-.145-1.38H12.24Z"/>
          </svg>
          <span>Entrar com o Google</span>
        </button>

        <div class="auth-footer">
          <p>Não tem uma conta? <a routerLink="/register">Cadastre-se</a></p>
        </div>

      </div><!-- /auth-card -->
    </div><!-- /auth-page -->
  `,
  styles: [`
    /* ═══════════════════════════════════════════════
       PAGE & CARD
    ═══════════════════════════════════════════════ */
    .auth-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .auth-card {
      position: relative;
      overflow: hidden;
      width: 100%;
      max-width: 440px;
      padding: 48px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      text-align: center;
      transition: box-shadow 0.3s ease;
    }

    /* Card shake — credential error feedback */
    .auth-card.card-shake {
      animation: cardShake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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

    /* Card entry */
    .animate-in {
      animation: authIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes authIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ═══════════════════════════════════════════════
       OVERLAY — sits on top of the card form
    ═══════════════════════════════════════════════ */
    .auth-overlay {
      position: absolute;
      inset: 0;
      z-index: 20;
      background: rgba(10, 14, 26, 0.84);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: var(--radius-lg);
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

    /* ═══════════════════════════════════════════════
       OVERLAY INNER — cross-fades between panels
    ═══════════════════════════════════════════════ */
    .overlay-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 0 32px;
    }

    /* Panel exit: slides current content up & fades out */
    .overlay-inner.panel-exit {
      animation: panelOut 0.2s ease-in forwards;
    }

    @keyframes panelOut {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(-10px); }
    }

    /* ═══════════════════════════════════════════════
       PANEL CONTENT — each state's content block
       Entry animation plays whenever *ngIf renders it
    ═══════════════════════════════════════════════ */
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

    /* ═══════════════════════════════════════════════
       STATE ICON AREA  —  always 72×72, no layout jump
    ═══════════════════════════════════════════════ */
    .state-icon-wrap {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Coloured ring (success & error states) */
    .icon-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-ring-success {
      background: rgba(34, 197, 94, 0.18);
      border: 2px solid rgba(34, 197, 94, 0.45);
      animation: ringBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      box-shadow: 0 0 32px rgba(34, 197, 94, 0.2);
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

    /* ── SVG Spinner (connecting state) ── */
    .spinner-svg {
      display: block;
      animation: spinSvg 0.9s linear infinite;
      transform-origin: center;
      filter: drop-shadow(0 0 8px rgba(0, 191, 234, 0.45));
    }

    .spinner-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 3.5;
    }

    .spinner-arc {
      fill: none;
      stroke: #00BFEA;
      stroke-width: 3.5;
      stroke-linecap: round;
      stroke-dasharray: 80 40;
    }

    @keyframes spinSvg {
      to { transform: rotate(360deg); }
    }

    /* ── Stroke-dashoffset check draw (success state) ── */
    .check-path {
      stroke-dasharray: 26;
      stroke-dashoffset: 26;
      animation: drawCheck 0.48s cubic-bezier(0.65, 0, 0.45, 1) 0.18s forwards;
    }

    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }

    /* ═══════════════════════════════════════════════
       OVERLAY TEXT
    ═══════════════════════════════════════════════ */
    .overlay-title {
      font-family: 'Outfit', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      letter-spacing: -0.2px;
    }

    .overlay-sub {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.52);
      margin: 0;
    }

    /* ── Retry button (error states) ── */
    .retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      padding: 10px 22px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 10px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;

      &:hover {
        background: rgba(255, 255, 255, 0.18);
        border-color: rgba(255, 255, 255, 0.36);
        transform: translateY(-1px);
      }
      &:active { transform: translateY(0); }
    }

    .cancel-link {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      margin-top: 2px;
      transition: color 0.2s;

      &:hover { color: rgba(255, 255, 255, 0.7); }
    }

    /* ═══════════════════════════════════════════════
       FORM ELEMENTS
    ═══════════════════════════════════════════════ */
    .logo-wrapper {
      margin-bottom: 24px;

      .logo-text {
        font-family: 'Outfit', sans-serif;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-primary);
      }
      .logo-accent { color: var(--accent); }
    }

    .auth-header {
      margin-bottom: 32px;

      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .input-group {
      text-align: left;
      margin-bottom: 24px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: var(--accent);
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      &:hover { color: var(--accent-hover); }
    }

    label {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &::placeholder { color: var(--text-muted); }

      &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
      }
    }

    /* Red highlight when credential error */
    .form-input.input-error {
      border-color: rgba(239, 68, 68, 0.65) !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    /* Inline credential error message */
    .inline-error {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: -8px 0 18px;
      padding: 10px 14px;
      background: rgba(239, 68, 68, 0.07);
      border: 1px solid rgba(239, 68, 68, 0.22);
      border-radius: 8px;
      color: #f87171;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      animation: panelIn 0.22s ease-out forwards;
    }

    .auth-btn {
      width: 100%;
      padding: 14px 24px;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 15px;
      margin-top: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) { background-color: var(--accent-hover); }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }

    .auth-footer {
      margin-top: 32px;
      p {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--text-secondary);
      }
      a {
        color: var(--accent);
        font-weight: 600;
        text-decoration: underline;
        &:hover { color: var(--accent-hover); }
      }
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 20px 0;
      color: var(--text-muted);
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border);
      }
      span { padding: 0 10px; }
    }

    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px 24px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover:not(:disabled) {
        background: var(--accent-light);
        border-color: var(--accent);
      }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
      .google-icon { flex-shrink: 0; }
    }
  `]
})
export class LoginComponent implements OnInit {
  email    = '';
  password = '';

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

  // ── Dependencies ─────────────────────────────────────────────────────────────
  private auth   = inject(AuthService);
  private toast  = inject(ToastService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  /**
   * V-08 fix: whitelist of safe OAuth error codes from the backend failure handler.
   * Raw error codes from the URL are never displayed — only friendly mapped strings.
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
        // V-08 fix: only whitelisted codes are accepted — raw URL value never used directly
        const safeCode = errorCode in this.oauthErrors ? errorCode : 'auth_failed';
        this.oauthErrorCode.set(safeCode);
        this.activePanel.set('oauth-error');
        this.overlayVisible.set(true);
        this.retryAction.set(() => window.location.replace('/oauth2/authorization/google'));
        return;
      }

      if (oauth2 === 'success') {
        // OAuth2 callback success: cookies already set by server. Call /me to populate state.
        this.activePanel.set('connecting');
        this.overlayVisible.set(true);
        this.loadOAuthSession();
      }
    });
  }

  // ── Public actions ─────────────────────────────────────────────────────────
  onLogin() {
    if (!this.email || !this.password) return;

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
    // Brief delay to let overlay animation start before page unloads
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
  /**
   * Loads user data after an OAuth2 redirect back to /login?oauth2=success.
   * Applies the same 10s timeout used for password login.
   */
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

  /**
   * Success flow: show success panel for ~650ms so user registers the feedback,
   * then navigate. Toast is kept as secondary reinforcement.
   */
  private handleSuccess() {
    this.transitionToPanel('success');
    setTimeout(() => {
      this.toast.success('Login realizado com sucesso!');
      this.router.navigate(['/']);
    }, 650);
  }

  /**
   * Error routing for email/password login.
   * Distinguishes between credential errors (inline, shake) and
   * infrastructure errors (overlay server-error state).
   */
  private handleLoginError(err: any) {
    const isTimeout      = err?.name === 'TimeoutError' || err?.code === 'ETIMEDOUT';
    const isNetworkError = err?.status === 0;
    const isServerError  = err?.status >= 500;

    if (isTimeout || isNetworkError || isServerError) {
      // Infrastructure/connectivity problem → keep overlay, switch to server-error panel
      this.transitionToPanel('server-error');
    } else if (err?.status === 429) {
      // Rate limit — treat as a credential-level message, not a server fault
      this.dismissAndShowCredentialError('Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
    } else {
      // 401 or other client error — never differentiate "wrong email" vs "wrong password"
      this.dismissAndShowCredentialError('E-mail ou senha incorretos.');
    }
  }

  /** Shows the overlay with the given panel immediately (no prior panel visible). */
  private showOverlay(panel: OverlayPanel) {
    this.activePanel.set(panel);
    this.overlayVisible.set(true);
  }

  /**
   * Crossfades to a different panel while the overlay stays visible.
   * Uses a 200ms exit animation before switching content.
   */
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

  /**
   * Hides the overlay with a fade-out animation, then removes it from DOM.
   * Operates independently of the panel state.
   */
  private hideOverlay() {
    if (!this.overlayVisible()) return;
    this.overlayExiting.set(true);
    setTimeout(() => {
      this.overlayExiting.set(false);
      this.overlayVisible.set(false);
    }, 240);
  }

  /**
   * Credential error flow:
   * 1. Fade out the overlay (220ms).
   * 2. Show inline error message below the form.
   * 3. Add red border to the input fields.
   * 4. Trigger the card shake animation.
   */
  private dismissAndShowCredentialError(message: string) {
    this.overlayExiting.set(true);
    setTimeout(() => {
      this.overlayExiting.set(false);
      this.overlayVisible.set(false);
      // Show inline error + red borders
      this.credentialError.set(message);
      this.inputsHaveError.set(true);
      // Trigger shake — must cycle signal off→on to allow retriggering
      this.cardShaking.set(true);
      setTimeout(() => this.cardShaking.set(false), 600);
    }, 220);
  }
}
