import { Component, EventEmitter, Output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-step-container">
      <!-- Multi-step progress indicator -->
      <div class="stepper">
        <div class="step active">
          <div class="step-circle">1</div>
          <span class="step-label">Dados pessoais</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-circle">2</div>
          <span class="step-label">Verificação</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-circle">3</div>
          <span class="step-label">Conclusão</span>
        </div>
      </div>

      <!-- Form header -->
      <div class="header">
        <h1 class="title">Crie sua conta</h1>
        <p class="subtitle">Preencha seus dados para começar</p>
      </div>

      <!-- Google Sign-Up button -->
      <button type="button" class="google-btn" (click)="loginWithGoogle()">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Cadastre-se com o Google
      </button>

      <!-- Divider -->
      <div class="divider">
        <span>ou cadastre-se com e-mail</span>
      </div>

      <form (ngSubmit)="onSubmit()" class="form-grid">
        
        <!-- Nome Completo -->
        <div class="form-group" 
             [class.focused]="focusedField() === 'fullName'"
             [class.valid]="fullNameValid() && isTouched('fullName')"
             [class.error]="!fullNameValid() && isTouched('fullName')">
          <label>Nome Completo</label>
          <div class="input-wrapper">
            <div class="icon-prefix">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <input type="text"
                   [ngModel]="fullName()"
                   (ngModelChange)="onFullNameInput($event)"
                   name="fullName"
                   maxlength="100"
                   (focus)="setFocus('fullName')"
                   (blur)="clearFocus('fullName')"
                   placeholder="João da Silva" />
            <div class="status-icon" *ngIf="isTouched('fullName')">
              <svg *ngIf="fullNameValid()" class="valid-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <svg *ngIf="!fullNameValid()" class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div class="error-message" *ngIf="!fullNameValid() && isTouched('fullName')">
            Insira seu nome e sobrenome (min. 2 caracteres).
          </div>
        </div>

        <!-- Telefone -->
        <div class="form-group"
             [class.focused]="focusedField() === 'phone'"
             [class.valid]="phoneValid() && isTouched('phone')"
             [class.error]="!phoneValid() && isTouched('phone')">
          <label>Telefone</label>
          <div class="input-wrapper">
            <div class="icon-prefix">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <input type="tel"
                   [ngModel]="phone()"
                   (ngModelChange)="onPhoneInput($event)"
                   name="phone"
                   (focus)="setFocus('phone')"
                   (blur)="clearFocus('phone')"
                   placeholder="(11) 99999-9999"
                   maxlength="15" />
            <div class="status-icon" *ngIf="isTouched('phone')">
              <svg *ngIf="phoneValid()" class="valid-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <svg *ngIf="!phoneValid()" class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div class="error-message" *ngIf="!phoneValid() && isTouched('phone')">
            Insira um número de telefone válido.
          </div>
        </div>

        <!-- E-mail -->
        <div class="form-group"
             [class.focused]="focusedField() === 'email'"
             [class.valid]="emailValid() && isTouched('email')"
             [class.error]="!emailValid() && isTouched('email')">
          <label>E-mail</label>
          <div class="input-wrapper">
            <div class="icon-prefix">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <input type="email"
                   [ngModel]="email()"
                   (ngModelChange)="onEmailInput($event)"
                   name="email"
                   maxlength="255"
                   (focus)="setFocus('email')"
                   (blur)="clearFocus('email')"
                   placeholder="seu@email.com" />
            <div class="status-icon" *ngIf="isTouched('email')">
              <svg *ngIf="emailValid()" class="valid-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <svg *ngIf="!emailValid()" class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div class="error-message" *ngIf="!emailValid() && isTouched('email')">
            Insira um e-mail válido.
          </div>
        </div>

        <!-- Senha -->
        <div class="form-group"
             [class.focused]="focusedField() === 'password'"
             [class.valid]="passwordValid() && isTouched('password')"
             [class.error]="!passwordValid() && isTouched('password')">
          <label>Senha</label>
          <div class="input-wrapper">
            <div class="icon-prefix">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <input [type]="showPassword() ? 'text' : 'password'"
                   [ngModel]="password()"
                   (ngModelChange)="onPasswordInput($event)"
                   name="password"
                   maxlength="100"
                   (focus)="setFocus('password')"
                   (blur)="clearFocus('password')"
                   placeholder="Sua senha segura" />
            <div class="status-icon toggle-password" (click)="showPassword.set(!showPassword())">
              <svg *ngIf="!showPassword()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg *ngIf="showPassword()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </div>
          </div>
          
          <!-- Password Strength Meter -->
          <div class="password-strength-container" *ngIf="password().length > 0">
            <div class="strength-bar-wrapper">
              <div class="strength-bar" [ngClass]="strengthColorClass()" [style.width.%]="(passwordStrengthScore() / 5) * 100"></div>
            </div>
            <div class="strength-label">{{ strengthLabel() }}</div>
            <ul class="strength-checklist">
              <li [class.met]="passwordLength()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Mínimo de 8 caracteres
              </li>
              <li [class.met]="passwordUpper()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Uma letra maiúscula
              </li>
              <li [class.met]="passwordLower()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Uma letra minúscula
              </li>
              <li [class.met]="passwordNumber()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Um número
              </li>
              <li [class.met]="passwordSpecial()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Um caractere especial
              </li>
            </ul>
          </div>
        </div>

        <!-- Confirmar Senha -->
        <div class="form-group"
             [class.focused]="focusedField() === 'confirmPassword'"
             [class.valid]="confirmPasswordValid() && isTouched('confirmPassword')"
             [class.error]="!confirmPasswordValid() && isTouched('confirmPassword')">
          <label>Confirmar Senha</label>
          <div class="input-wrapper">
            <div class="icon-prefix">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <input [type]="showConfirmPassword() ? 'text' : 'password'"
                   [ngModel]="confirmPassword()"
                   (ngModelChange)="onConfirmPasswordInput($event)"
                   name="confirmPassword"
                   maxlength="100"
                   (focus)="setFocus('confirmPassword')"
                   (blur)="clearFocus('confirmPassword')"
                   placeholder="Confirme sua senha" />
            <div class="status-icon toggle-password" (click)="showConfirmPassword.set(!showConfirmPassword())">
              <svg *ngIf="!showConfirmPassword()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg *ngIf="showConfirmPassword()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </div>
          </div>
          <div class="error-message" *ngIf="!confirmPasswordValid() && isTouched('confirmPassword')">
            As senhas não coincidem.
          </div>
        </div>

        <!-- Termos -->
        <div class="terms-group">
          <label class="checkbox-wrapper">
            <input type="checkbox" [ngModel]="termsAccepted()" (ngModelChange)="termsAccepted.set($event)" name="termsAccepted" />
            <div class="custom-checkbox" [class.checked]="termsAccepted()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="terms-text">Li e concordo com os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a></span>
          </label>
          <div class="error-message" *ngIf="!termsAccepted() && isTouched('terms')">
            Você precisa concordar com os termos para continuar.
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" [disabled]="submitting()">
          <span *ngIf="!submitting()">Criar minha conta</span>
          <div class="spinner" *ngIf="submitting()"></div>
        </button>
      </form>

      <!-- Footer -->
      <div class="footer">
        <p>Já tem uma conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-step-container {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }

    /* Stepper */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }
    .step.active {
      opacity: 1;
    }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-main);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      border: 2px solid var(--border);
      transition: all 0.3s ease;
    }
    .step.active .step-circle {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-light);
    }
    .step-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .step.active .step-label {
      color: var(--text-primary);
      font-weight: 600;
    }
    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border);
      margin: 0 1rem;
      margin-bottom: 20px;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }
    .subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Google Button */
    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }
    .google-btn:hover {
      background: var(--bg-main);
      border-color: var(--border-light);
    }
    .google-btn:active {
      transform: scale(0.98);
    }
    .google-icon {
      width: 20px;
      height: 20px;
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.5rem 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border);
    }
    .divider span {
      padding: 0 1rem;
    }

    /* Form */
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: color 0.3s ease;
    }
    .form-group.focused label {
      color: var(--accent);
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .icon-prefix {
      position: absolute;
      left: 1rem;
      width: 20px;
      height: 20px;
      color: var(--text-muted);
      transition: color 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .input-wrapper input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 2.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      color: var(--text-primary);
      background: var(--surface);
      transition: all 0.3s ease;
      outline: none;
    }
    .input-wrapper input::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
    }

    /* Focus & Validation States */
    .form-group.focused input {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-light);
    }
    .form-group.focused .icon-prefix {
      color: var(--accent);
    }
    .form-group.valid input {
      border-color: var(--success);
    }
    .form-group.valid.focused input {
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }
    .form-group.error input {
      border-color: var(--error);
      background: rgba(239, 68, 68, 0.02);
    }
    .form-group.error.focused input {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    /* Status Icons */
    .status-icon {
      position: absolute;
      right: 1rem;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .valid-icon {
      color: var(--success);
    }
    .error-icon {
      color: var(--error);
    }
    .toggle-password {
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .toggle-password:hover {
      color: var(--text-primary);
    }

    /* Error message */
    .error-message {
      font-size: 0.75rem;
      color: var(--error);
      display: flex;
      align-items: center;
      animation: slideDown 0.3s ease;
    }

    /* Password Strength */
    .password-strength-container {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: var(--bg-main);
      border-radius: var(--radius-sm);
      animation: fadeIn 0.3s ease;
    }
    .strength-bar-wrapper {
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    .strength-bar {
      height: 100%;
      width: 0;
      transition: width 0.3s ease, background-color 0.3s ease;
    }
    .strength-bar.weak { background: var(--error); }
    .strength-bar.fair { background: var(--warning); }
    .strength-bar.good { background: var(--success); }
    
    .strength-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-align: right;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }

    .strength-checklist {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .strength-checklist li {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.3s ease;
    }
    .strength-checklist svg {
      width: 14px;
      height: 14px;
      opacity: 0.3;
      transition: all 0.3s ease;
    }
    .strength-checklist li.met {
      color: var(--success);
    }
    .strength-checklist li.met svg {
      opacity: 1;
      transform: scale(1.1);
    }

    /* Terms Checkbox */
    .terms-group {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .checkbox-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
    }
    .checkbox-wrapper input {
      display: none;
    }
    .custom-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .custom-checkbox svg {
      width: 14px;
      height: 14px;
      color: white;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .custom-checkbox.checked {
      background: var(--accent);
      border-color: var(--accent);
    }
    .custom-checkbox.checked svg {
      opacity: 1;
      transform: scale(1);
    }
    .terms-text {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .terms-text a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }
    .terms-text a:hover {
      text-decoration: underline;
    }

    /* Submit Button */
    .submit-btn {
      width: 100%;
      padding: 0.875rem;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 52px;
      box-shadow: 0 4px 12px var(--accent-light);
    }
    .submit-btn:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }
    .submit-btn:active {
      transform: translateY(1px);
    }
    .submit-btn:disabled {
      background: var(--border);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .footer a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      margin-left: 0.25rem;
      transition: color 0.2s ease;
    }
    .footer a:hover {
      color: var(--accent-hover);
      text-decoration: underline;
    }

    /* Animations */
    @keyframes popIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes slideDown {
      0% { transform: translateY(-10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class RegisterStep1Component {
  @Output() next = new EventEmitter<any>();

  fullName = signal('');
  phone = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  termsAccepted = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  focusedField = signal<string | null>(null);
  touchedFields = signal<{ [key: string]: boolean }>({});
  submitting = signal(false);

  // Validation Computeds
  fullNameValid = computed(() => {
    const val = this.fullName().trim();
    const noDigits = !/\d/.test(val);
    const validFormat = /^[A-Za-zÀ-ÿ']+(?:\s+[A-Za-zÀ-ÿ']+)+$/.test(val);
    return val.length >= 2 && val.length <= 100 && noDigits && validFormat;
  });

  phoneValid = computed(() => {
    const digits = this.phone().replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  });

  emailValid = computed(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.email());
  });

  passwordLength = computed(() => this.password().length >= 8);
  passwordUpper = computed(() => /[A-Z]/.test(this.password()));
  passwordLower = computed(() => /[a-z]/.test(this.password()));
  passwordNumber = computed(() => /[0-9]/.test(this.password()));
  passwordSpecial = computed(() => /[^A-Za-z0-9]/.test(this.password()));

  passwordStrengthScore = computed(() => {
    return [
      this.passwordLength(),
      this.passwordUpper(),
      this.passwordLower(),
      this.passwordNumber(),
      this.passwordSpecial()
    ].filter(Boolean).length;
  });

  passwordValid = computed(() => this.passwordStrengthScore() === 5);

  confirmPasswordValid = computed(() => {
    return this.password() === this.confirmPassword() && this.confirmPassword().length > 0;
  });

  formValid = computed(() => 
    this.fullNameValid() &&
    this.phoneValid() &&
    this.emailValid() &&
    this.passwordValid() &&
    this.confirmPasswordValid() &&
    this.termsAccepted()
  );

  strengthColorClass = computed(() => {
    const score = this.passwordStrengthScore();
    if (score <= 2) return 'weak';
    if (score <= 4) return 'fair';
    return 'good';
  });

  strengthLabel = computed(() => {
    const score = this.passwordStrengthScore();
    if (score === 0) return '';
    if (score <= 2) return 'Fraca';
    if (score <= 4) return 'Média';
    return 'Forte';
  });

  // Event Handlers
  setFocus(field: string) {
    this.focusedField.set(field);
  }

  clearFocus(field: string) {
    if (this.focusedField() === field) {
      this.focusedField.set(null);
    }
    this.markTouched(field);
  }

  isTouched(field: string): boolean {
    return !!this.touchedFields()[field];
  }

  markTouched(field: string) {
    this.touchedFields.update(curr => ({ ...curr, [field]: true }));
  }

  onFullNameInput(value: string) {
    // Strip digits and special characters - allow only letters, accents, apostrophes, spaces
    const clean = value.replace(/[^A-Za-z\u00C0-\u017F'\s]/g, '');
    this.fullName.set(clean);
  }

  onEmailInput(value: string) {
    // Strip spaces
    this.email.set(value.replace(/\s/g, '').slice(0, 255));
  }

  onPasswordInput(value: string) {
    this.password.set(value.slice(0, 100));
  }

  onConfirmPasswordInput(value: string) {
    this.confirmPassword.set(value.slice(0, 100));
  }

  onPhoneInput(value: string) {
    let x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    if (!x) {
      this.phone.set('');
      return;
    }
    const formatted = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    this.phone.set(formatted);
  }

  loginWithGoogle() {
    window.location.replace('/oauth2/authorization/google');
  }

  onSubmit() {
    // Mark all as touched on submit
    this.touchedFields.set({
      fullName: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true
    });

    if (this.formValid()) {
      this.submitting.set(true);
      // Simulate slight delay for premium feel
      setTimeout(() => {
        this.next.emit({
          fullName: this.fullName(),
          phone: this.phone().replace(/\D/g, ''),
          email: this.email(),
          password: this.password()
        });
        this.submitting.set(false);
      }, 500);
    }
  }
}
