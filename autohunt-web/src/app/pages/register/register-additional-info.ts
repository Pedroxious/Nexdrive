import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-register-additional-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-card animate-in">
      <div class="logo-wrapper">
        <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
      </div>

      <div class="success-illustration-wrapper">
        <!-- Circular Success Checkmark Icon -->
        <div class="success-badge">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
      </div>

      <div class="auth-header">
        <h1>Cadastro confirmado</h1>
        <p>Sua conta foi verificada. Se desejar, complete seus dados agora para agilizar futuras locações de veículos.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="step-form">
        <!-- CPF Input (opcional no cadastro) -->
        <div class="input-group">
          <label for="cpf-input">CPF (Opcional)</label>
          <input 
            id="cpf-input"
            type="text" 
            [value]="cpf" 
            (input)="onCpfInput($event)"
            placeholder="000.000.000-00" 
            class="form-input"
          >
          <span class="input-tip">Você também poderá preencher ou editar seu CPF mais tarde no seu perfil.</span>
        </div>

        <button type="submit" class="auth-btn">
          Finalizar Cadastro
        </button>

        <button type="button" class="skip-btn" (click)="onSkip()">
          Preencher depois
        </button>
      </form>
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

    .success-illustration-wrapper {
      margin: 24px 0;
      display: flex;
      justify-content: center;
    }

    .success-badge {
      width: 72px;
      height: 72px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-header {
      margin-bottom: 28px;
      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        color: var(--text-secondary);
        font-size: 13.5px;
        line-height: 1.5;
      }
    }

    .input-group {
      text-align: left;
      margin-bottom: 24px;
      
      label {
        display: block;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-secondary);
      }
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      outline: none;
      transition: all 0.2s ease;
      
      &::placeholder {
        color: var(--text-muted);
      }
      
      &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
      }
    }

    .input-tip {
      display: block;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 6px;
      line-height: 1.4;
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
      margin-bottom: 12px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: var(--accent-hover);
      }
    }

    .skip-btn {
      width: 100%;
      padding: 10px 24px;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      background-color: var(--surface-secondary);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: var(--border);
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
      .auth-card {
        padding: 24px;
      }
    }
  `]
})
export class RegisterAdditionalInfoComponent {
  cpf = '';

  @Output() finish = new EventEmitter<string | null>();

  toast = inject(ToastService);

  onCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    
    let formatted = '';
    if (val.length > 0) {
      formatted = val.substring(0, 3);
      if (val.length > 3) {
        formatted += '.' + val.substring(3, 6);
      }
      if (val.length > 6) {
        formatted += '.' + val.substring(6, 9);
      }
      if (val.length > 9) {
        formatted += '-' + val.substring(9, 11);
      }
    }
    input.value = formatted;
    this.cpf = formatted;
  }

  onSkip() {
    this.finish.emit(null);
  }

  onSubmit() {
    if (this.cpf) {
      const cleanCPF = this.cpf.replace(/\D/g, '');
      if (cleanCPF.length !== 11) {
        this.toast.error('CPF inválido. Deve conter 11 dígitos.');
        return;
      }
      this.finish.emit(this.cpf);
    } else {
      this.finish.emit(null);
    }
  }
}
