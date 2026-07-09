import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-register-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-card animate-in">
      <div class="logo-wrapper">
        <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
      </div>

      <div class="auth-header">
        <h1>Para começar, preencha seus dados básicos</h1>
        <p>Preencha as informações abaixo para criar sua conta</p>
      </div>

      <form (ngSubmit)="onSubmit()" #step1Form="ngForm" class="step-form">
        <div class="form-grid">
          <!-- Nome Completo -->
          <div class="input-group full-width">
            <label for="name-input">Nome Completo *</label>
            <input 
              id="name-input"
              type="text" 
              [(ngModel)]="fullName" 
              name="fullName" 
              class="form-input" 
              placeholder="Nome completo" 
              required
            >
          </div>

          <!-- Telefone -->
          <div class="input-group">
            <label for="phone-input">Telefone *</label>
            <input 
              id="phone-input"
              type="text" 
              [value]="phone" 
              (input)="onPhoneInput($event, false)"
              placeholder="(00) 00000-0000" 
              required
              class="form-input"
            >
          </div>

          <!-- Confirmação de Telefone -->
          <div class="input-group">
            <label for="confirm-phone-input">Confirmação de telefone *</label>
            <input 
              id="confirm-phone-input"
              type="text" 
              [value]="confirmPhone" 
              (input)="onPhoneInput($event, true)"
              placeholder="(00) 00000-0000" 
              required
              class="form-input"
            >
          </div>

          <!-- E-mail -->
          <div class="input-group">
            <label for="email-input">E-mail *</label>
            <input 
              id="email-input"
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              class="form-input" 
              placeholder="seu@email.com" 
              required
            >
          </div>

          <!-- Confirmação de E-mail -->
          <div class="input-group">
            <label for="confirm-email-input">Confirmação do e-mail *</label>
            <input 
              id="confirm-email-input"
              type="email" 
              [(ngModel)]="confirmEmail" 
              name="confirmEmail" 
              class="form-input" 
              placeholder="seu@email.com" 
              required
            >
          </div>

          <!-- Senha -->
          <div class="input-group">
            <label for="password-input">Senha *</label>
            <div class="password-wrapper">
              <input 
                id="password-input"
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="Senha" 
                required 
                class="form-input"
              >
              <button type="button" class="toggle-eye" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <!-- Confirmar Senha -->
          <div class="input-group">
            <label for="confirm-password-input">Confirme sua senha *</label>
            <div class="password-wrapper">
              <input 
                id="confirm-password-input"
                [type]="showConfirmPassword ? 'text' : 'password'" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword" 
                placeholder="Confirme sua senha" 
                required 
                class="form-input"
              >
              <button type="button" class="toggle-eye" (click)="showConfirmPassword = !showConfirmPassword">
                <svg *ngIf="!showConfirmPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg *ngIf="showConfirmPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Requisitos de Senha -->
        <div class="requirements-box">
          <p class="requirements-title">Lembre-se:</p>
          <ul class="requirements-list">
            <li [class.met]="isLengthMet()">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              No mínimo 8 caracteres
            </li>
            <li [class.met]="isUppercaseMet()">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Uma letra maiúscula
            </li>
            <li [class.met]="isLowercaseMet()">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Uma letra minúscula
            </li>
            <li [class.met]="isNumberMet()">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Pelo menos um número
            </li>
            <li [class.met]="isSpecialMet()">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Um caractere especial
            </li>
            <li [class.met]="isMatchMet()">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Senha e confirme sua senha devem ser iguais
            </li>
          </ul>
        </div>

        <button type="submit" class="auth-btn" [disabled]="!isFormValid(step1Form)">
          Prosseguir
        </button>
      </form>

      <div class="auth-footer">
        <p>Já tem uma conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 600px;
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
        margin-bottom: 6px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        color: var(--text-secondary);
        font-size: 13px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
      margin-bottom: 24px;
    }

    .input-group {
      text-align: left;
      
      &.full-width {
        grid-column: span 2;
      }
      
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

    .password-wrapper {
      position: relative;
      width: 100%;
      
      .form-input {
        padding-right: 40px;
      }
      
      .toggle-eye {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          color: var(--text-primary);
        }
      }
    }

    /* Requirements Checklist */
    .requirements-box {
      background: var(--bg-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      text-align: left;
      margin-bottom: 24px;
    }

    .requirements-title {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 10px 0;
    }

    .requirements-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      
      li {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        font-weight: 500;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
        transition: color 0.2s ease;
        
        .check-icon {
          width: 12px;
          height: 12px;
          stroke: var(--text-muted);
          transition: stroke 0.2s ease;
        }
        
        &.met {
          color: var(--accent);
          
          .check-icon {
            stroke: var(--accent);
          }
        }
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
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: var(--accent-hover);
      }
      
      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }

    .auth-footer {
      margin-top: 24px;
      p {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--text-secondary);
      }
      a {
        color: var(--accent);
        font-weight: 600;
        text-decoration: underline;
        &:hover {
          color: var(--accent-hover);
        }
      }
    }

    .animate-in {
      animation: authIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes authIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
        
        .input-group.full-width {
          grid-column: span 1;
        }
      }
      .requirements-list {
        grid-template-columns: 1fr;
      }
      .auth-card {
        padding: 24px;
      }
    }
  `]
})
export class RegisterStep1Component {
  fullName = '';
  phone = '';
  confirmPhone = '';
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  @Output() next = new EventEmitter<any>();

  toast = inject(ToastService);

  // Requirement checks
  isLengthMet(): boolean {
    return this.password.length >= 8;
  }

  isUppercaseMet(): boolean {
    return /[A-Z]/.test(this.password);
  }

  isLowercaseMet(): boolean {
    return /[a-z]/.test(this.password);
  }

  isNumberMet(): boolean {
    return /[0-9]/.test(this.password);
  }

  isSpecialMet(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
  }

  isMatchMet(): boolean {
    return this.password === this.confirmPassword && this.password.length > 0;
  }

  isFormValid(form: any): boolean {
    return form.valid &&
      this.phone === this.confirmPhone &&
      this.phone.replace(/\D/g, '').length >= 10 &&
      this.email.toLowerCase().trim() === this.confirmEmail.toLowerCase().trim() &&
      this.isLengthMet() &&
      this.isUppercaseMet() &&
      this.isLowercaseMet() &&
      this.isNumberMet() &&
      this.isSpecialMet() &&
      this.isMatchMet();
  }

  onPhoneInput(event: Event, isConfirm: boolean) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    
    let formatted = '';
    if (val.length > 0) {
      formatted = '(' + val.substring(0, 2);
      if (val.length > 2) {
        formatted += ') ' + val.substring(2, 7);
      }
      if (val.length > 7) {
        formatted += '-' + val.substring(7, 11);
      }
    }
    input.value = formatted;
    if (isConfirm) {
      this.confirmPhone = formatted;
    } else {
      this.phone = formatted;
    }
  }

  onSubmit() {
    this.next.emit({
      fullName: this.fullName,
      phone: this.phone,
      email: this.email,
      password: this.password
    });
  }
}
