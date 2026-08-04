import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-additional-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wizard-container">
      <!-- Progress indicator -->
      <div class="progress-indicator">
        <div class="step completed">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span class="step-label">Dados pessoais</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step completed">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span class="step-label">Verificação</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step completed">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span class="step-label">Conclusão</span>
        </div>
      </div>

      <!-- Success Celebration -->
      <div class="success-celebration">
        <div class="confetti-container">
           <div class="confetti c1"></div>
           <div class="confetti c2"></div>
           <div class="confetti c3"></div>
           <div class="confetti c4"></div>
           <div class="confetti c5"></div>
           <div class="confetti c6"></div>
        </div>
        <div class="checkmark-wrapper">
          <svg class="checkmark" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h2 class="title">Conta criada com sucesso!</h2>
        <p class="subtitle">Seu cadastro foi confirmado. Complete os dados abaixo para agilizar futuras locações.</p>
      </div>

      <!-- Form -->
      <div class="form-container">
        <div class="form-group" [class.is-valid]="cpfStatus() === 'valid'" [class.is-invalid]="cpfStatus() === 'invalid'">
          <label for="cpf">CPF (Opcional)</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <!-- ID Card Icon -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M7 15h.01M11 15h2M7 19h.01M11 19h2"></path>
              </svg>
            </div>
            <input 
              id="cpf"
              type="text"
              [ngModel]="cpf()"
              (ngModelChange)="onCpfChange($event)"
              placeholder="000.000.000-00"
              maxlength="14"
            />
          </div>
          <div class="helper-text" *ngIf="cpfStatus() === 'empty'">Opcional — você pode preencher depois no seu perfil.</div>
          <div class="helper-text success-text" *ngIf="cpfStatus() === 'valid'">CPF válido</div>
          <div class="helper-text error-text" *ngIf="cpfStatus() === 'invalid'">CPF inválido</div>
        </div>
        
        <div class="actions">
          <button class="btn-primary" (click)="onFinish()">Finalizar e acessar</button>
          <button class="btn-secondary" (click)="onSkip()">Preencher depois</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
    }
    
    .wizard-container {
      background: var(--surface, #FFFFFF);
      padding: 32px;
      border-radius: var(--radius-xl, 24px);
      box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1));
      max-width: 480px;
      margin: 0 auto;
      border: 1px solid var(--border-light, #F0F2F5);
    }

    /* Progress Indicator */
    .progress-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      z-index: 2;
    }

    .step-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      background: var(--surface);
      border: 2px solid var(--border);
      color: var(--text-muted);
      transition: all 0.3s ease;
    }

    .step.completed .step-icon {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .step.completed .step-icon svg {
      width: 16px;
      height: 16px;
    }

    .step-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .step.completed .step-label {
      color: var(--text-primary);
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border);
      margin: 0 16px;
      position: relative;
      top: -10px;
      z-index: 1;
    }

    .step-line.completed {
      background: var(--accent);
    }

    /* Success Celebration */
    .success-celebration {
      text-align: center;
      margin-bottom: 32px;
      position: relative;
    }

    .checkmark-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
      position: relative;
      z-index: 2;
    }

    .checkmark {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: block;
      stroke-width: 3;
      stroke: var(--success, #10B981);
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px var(--success, #10B981);
      animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    }

    .checkmark-circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 3;
      stroke-miterlimit: 10;
      stroke: var(--success, #10B981);
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes scale {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }

    @keyframes fill {
      100% {
        box-shadow: inset 0px 0px 0px 30px rgba(16, 185, 129, 0.1);
      }
    }

    /* Confetti */
    .confetti-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .confetti {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      opacity: 0;
      animation: pop 1s ease-out forwards;
    }

    .c1 { background: var(--accent); top: 30%; left: 30%; animation-delay: 0.3s; transform: translate(-20px, -20px); }
    .c2 { background: var(--success); top: 20%; left: 60%; animation-delay: 0.4s; transform: translate(30px, -40px); }
    .c3 { background: var(--warning, #F59E0B); top: 50%; left: 20%; animation-delay: 0.5s; transform: translate(-40px, 10px); }
    .c4 { background: var(--error, #E11D48); top: 40%; left: 70%; animation-delay: 0.4s; transform: translate(40px, -10px); }
    .c5 { background: var(--accent); top: 70%; left: 40%; animation-delay: 0.6s; transform: translate(-10px, 40px); }
    .c6 { background: var(--success); top: 60%; left: 80%; animation-delay: 0.5s; transform: translate(20px, 30px); }

    @keyframes pop {
      0% {
        opacity: 1;
        transform: translate(0, 0) scale(0);
      }
      100% {
        opacity: 0;
        transform: translate(var(--tx, 20px), var(--ty, -50px)) scale(1.5);
      }
    }
    
    .c1 { --tx: -40px; --ty: -60px; }
    .c2 { --tx: 40px; --ty: -70px; }
    .c3 { --tx: -60px; --ty: -10px; }
    .c4 { --tx: 60px; --ty: -20px; }
    .c5 { --tx: -20px; --ty: 50px; }
    .c6 { --tx: 50px; --ty: 40px; }

    .title {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    /* Form */
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
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
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-icon svg {
      width: 20px;
      height: 20px;
    }

    input {
      width: 100%;
      height: 48px;
      padding: 0 16px 0 44px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md, 12px);
      font-size: 15px;
      color: var(--text-primary);
      background: var(--bg-main, #F5F6FA);
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--surface);
      box-shadow: 0 0 0 3px var(--accent-light, rgba(0, 191, 234, 0.1));
    }

    .is-valid input {
      border-color: var(--success);
    }
    
    .is-valid input:focus {
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .is-invalid input {
      border-color: var(--error);
    }
    
    .is-invalid input:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .helper-text {
      font-size: 13px;
      color: var(--text-muted);
    }

    .success-text {
      color: var(--success);
    }

    .error-text {
      color: var(--error);
    }

    /* Actions */
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    button {
      height: 48px;
      border-radius: var(--radius-md, 12px);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
    }

    .btn-primary {
      background: var(--accent, #00BFEA);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-hover, #0099C4);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--bg-main, #F5F6FA);
      color: var(--text-primary);
    }
  `]
})
export class RegisterAdditionalInfoComponent {
  @Output() finish = new EventEmitter<string | null>();

  cpf = signal<string>('');
  cpfStatus = signal<'empty' | 'valid' | 'invalid'>('empty');

  onCpfChange(value: string) {
    const formatted = this.formatCpf(value);
    this.cpf.set(formatted);
    this.updateStatus(formatted);
  }

  formatCpf(value: string): string {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return v;
  }

  updateStatus(value: string) {
    const clean = value.replace(/\D/g, '');
    if (clean.length === 0) {
      this.cpfStatus.set('empty');
      return;
    }
    if (clean.length < 11) {
      this.cpfStatus.set('empty');
      return;
    }
    
    if (this.validateCpf(clean)) {
      this.cpfStatus.set('valid');
    } else {
      this.cpfStatus.set('invalid');
    }
  }

  validateCpf(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  onFinish() {
    const cleanCpf = this.cpf().replace(/\D/g, '');
    this.finish.emit(cleanCpf.length === 11 && this.cpfStatus() === 'valid' ? cleanCpf : null);
  }

  onSkip() {
    this.finish.emit(null);
  }
}
