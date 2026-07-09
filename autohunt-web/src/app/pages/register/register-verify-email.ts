import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-register-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-card animate-in">
      <div class="logo-wrapper">
        <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
      </div>

      <div class="auth-header">
        <h1>Confirme seu e-mail</h1>
        <p class="description-text">
          Enviamos um código de verificação para o e-mail:<br>
          <strong class="email-highlight">{{ email }}</strong>
        </p>
      </div>

      <form (ngSubmit)="onSubmit()" class="step-form">
        <!-- Segmented 6-digit code input -->
        <div class="code-inputs-container">
          @for (d of codeDigits; let idx = $index; track idx) {
            <input 
              [id]="'digit-' + idx"
              type="text" 
              pattern="[0-9]*" 
              inputmode="numeric" 
              maxlength="1" 
              [value]="codeDigits[idx]" 
              (input)="onDigitInput($event, idx)"
              (keydown)="onKeyDown($event, idx)"
              class="digit-input"
              autocomplete="one-time-code"
            >
          }
        </div>

        <button type="submit" class="auth-btn" [disabled]="!isCodeComplete() || isSubmitting()">
          <div class="spinner-small" *ngIf="isSubmitting()"></div>
          {{ isSubmitting() ? 'Verificando...' : 'Confirmar' }}
        </button>
      </form>

      <div class="resend-container">
        <button type="button" class="resend-btn" (click)="onResend()" [disabled]="resendCountdown() > 0">
          {{ resendCountdown() > 0 ? 'Reenviar código em ' + resendCountdown() + 's' : 'Reenviar código' }}
        </button>
      </div>

      <div class="auth-footer">
        <button type="button" class="back-link-btn" (click)="onBack()">Voltar para dados básicos</button>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 500px;
      padding: 40px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      text-align: center;
      transition: all 0.3s ease;
    }

    .logo-wrapper {
      margin-bottom: 20px;
      .logo-text {
        font-family: 'Outfit', sans-serif;
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-primary);
      }
      .logo-accent {
        color: var(--accent);
      }
    }

    .auth-header {
      margin-bottom: 28px;
      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-primary);
      }
      .description-text {
        font-family: 'Inter', sans-serif;
        color: var(--text-secondary);
        font-size: 13.5px;
        line-height: 1.5;
      }
      .email-highlight {
        color: var(--text-primary);
        font-weight: 600;
        word-break: break-all;
      }
    }

    .code-inputs-container {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin: 32px 0;
    }

    .digit-input {
      width: 48px;
      height: 56px;
      text-align: center;
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--bg-main);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      outline: none;
      transition: all 0.2s ease;
      
      &:focus {
        border-color: var(--accent);
        background: var(--surface);
        box-shadow: 0 0 0 3px var(--accent-light);
      }
    }

    .auth-btn {
      width: 100%;
      padding: 12px 24px;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 14.5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: var(--accent-hover);
      }
      
      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .resend-container {
      margin-top: 24px;
    }

    .resend-btn {
      background: none;
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--accent);
      cursor: pointer;
      padding: 6px 12px;
      border-radius: var(--radius-xs);
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        color: var(--accent-hover);
        background-color: var(--accent-light);
      }
      
      &:disabled {
        color: var(--text-muted);
        cursor: not-allowed;
      }
    }

    .auth-footer {
      margin-top: 32px;
      border-top: 1px solid var(--border);
      padding-top: 20px;
    }

    .back-link-btn {
      background: none;
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      text-decoration: underline;
      
      &:hover {
        color: var(--text-primary);
      }
    }

    .animate-in {
      animation: authIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes authIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .digit-input {
        width: 38px;
        height: 48px;
        font-size: 18px;
      }
      .auth-card {
        padding: 24px;
      }
    }
  `]
})
export class RegisterVerifyEmailComponent {
  @Input() email = '';
  @Output() confirm = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  codeDigits = ['', '', '', '', '', ''];
  isSubmitting = signal(false);
  resendCountdown = signal(0);
  private countdownTimer: any;

  toast = inject(ToastService);

  isCodeComplete(): boolean {
    return this.codeDigits.every(digit => digit !== '');
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 0) {
      this.codeDigits[index] = val.charAt(0);
      input.value = val.charAt(0);
      // Auto-focus next input
      if (index < 5) {
        const nextInput = document.getElementById(`digit-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else {
      this.codeDigits[index] = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        this.codeDigits[index - 1] = '';
      }
    }
  }

  onResend() {
    this.toast.success('Código reenviado com sucesso para seu e-mail.');
    this.resendCountdown.set(30);
    this.countdownTimer = setInterval(() => {
      this.resendCountdown.update(c => c - 1);
      if (this.resendCountdown() === 0) {
        clearInterval(this.countdownTimer);
      }
    }, 1000);
  }

  onBack() {
    this.back.emit();
  }

  onSubmit() {
    if (!this.isCodeComplete()) return;
    this.isSubmitting.set(true);
    // Mock request: delay and proceed
    setTimeout(() => {
      this.isSubmitting.set(false);
      const code = this.codeDigits.join('');
      this.confirm.emit(code);
    }, 1200);
  }
}
