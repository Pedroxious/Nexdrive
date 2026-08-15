import { Component, Input, Output, EventEmitter, signal, ViewChildren, QueryList, ElementRef, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Assuming a ToastService exists, if not it will be ignored or mocked by the app
// import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-register-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="verify-container">
      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <div class="step completed">
          <div class="step-circle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="step-label">Dados pessoais</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step active">
          <div class="step-circle">2</div>
          <span class="step-label">Verificação</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-circle">3</div>
          <span class="step-label">Conclusão</span>
        </div>
      </div>

      <!-- Header Content -->
      <div class="header">
        <div class="icon-container">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <h2 class="title">Confirme seu e-mail</h2>
        <p class="subtitle">
          Enviamos um código de 6 dígitos para <br />
          <span class="email-highlight">{{ email }}</span>
        </p>
      </div>

      <!-- Code Inputs -->
      <div class="code-inputs-container">
        <div class="code-inputs" (paste)="onPaste($event)">
          <input
            *ngFor="let digit of digits; let i = index"
            #digitInput
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="digit-input"
            [class.has-error]="isError()"
            [value]="digits[i]"
            (input)="onInput($event, i)"
            (keydown)="onKeyDown($event, i)"
            (focus)="onFocus(i)"
            autocomplete="off"
          />
        </div>
        
        <div class="error-message" *ngIf="isError()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Código inválido. Tente novamente.
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <button 
          class="btn-primary" 
          [class.loading]="isLoading()" 
          [disabled]="isLoading() || !isFormValid()"
          (click)="verifyCode()">
          <span class="btn-content" *ngIf="!isLoading()">Verificar código</span>
          <span class="btn-content" *ngIf="isLoading()">
            <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            Verificando...
          </span>
        </button>

        <div class="resend-container">
          <button 
            class="btn-resend" 
            [disabled]="cooldown() > 0"
            (click)="resendCode()">
            Reenviar código
          </button>
          <span class="timer" *ngIf="cooldown() > 0">
            Aguarde {{ cooldown() }}s
          </span>
        </div>
      </div>

      <!-- Back Link -->
      <button class="btn-back" (click)="onBack()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Voltar para dados pessoais
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
    }

    .verify-container {
      background: var(--surface, #FFFFFF);
      border-radius: var(--radius-xl, 24px);
      padding: 40px;
      box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.05));
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* Progress Indicator */
    .progress-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 40px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-main, #F5F6FA);
      border: 2px solid var(--border, #E5E8ED);
      color: var(--text-muted, #8899A6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .step-label {
      font-size: 12px;
      color: var(--text-muted, #8899A6);
      margin-top: 8px;
      font-weight: 500;
      position: absolute;
      top: 36px;
      white-space: nowrap;
    }

    .step.active .step-circle {
      background: var(--accent, #00BFEA);
      border-color: var(--accent, #00BFEA);
      color: white;
      box-shadow: 0 0 0 4px var(--accent-light, rgba(0, 191, 234, 0.1));
    }
    
    .step.active .step-label {
      color: var(--text-primary, #0F1419);
      font-weight: 600;
    }

    .step.completed .step-circle {
      background: var(--success, #10B981);
      border-color: var(--success, #10B981);
      color: white;
    }

    .step.completed .step-label {
      color: var(--success, #10B981);
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border, #E5E8ED);
      margin: 0 12px;
      margin-bottom: 24px;
      transition: background 0.3s ease;
    }

    .step-line.completed {
      background: var(--success, #10B981);
    }

    /* Header */
    .header {
      margin-bottom: 32px;
    }

    .icon-container {
      width: 64px;
      height: 64px;
      background: var(--accent-light, rgba(0,191,234,0.10));
      color: var(--accent, #00BFEA);
      border-radius: var(--radius-lg, 16px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .title {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary, #0F1419);
      margin: 0 0 12px;
    }

    .subtitle {
      font-size: 15px;
      color: var(--text-secondary, #536471);
      line-height: 1.5;
      margin: 0;
    }

    .email-highlight {
      font-weight: 600;
      color: var(--text-primary, #0F1419);
    }

    /* Code Inputs */
    .code-inputs-container {
      width: 100%;
      margin-bottom: 32px;
    }

    .code-inputs {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 12px;
    }

    .digit-input {
      width: 48px;
      height: 56px;
      border: 2px solid var(--border, #E5E8ED);
      border-radius: var(--radius-md, 12px);
      background: var(--surface, #FFFFFF);
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      color: var(--text-primary, #0F1419);
      transition: all 0.2s ease;
      outline: none;
      padding: 0;
    }

    .digit-input:focus {
      border-color: var(--accent, #00BFEA);
      box-shadow: 0 0 0 4px var(--accent-light, rgba(0, 191, 234, 0.1));
      transform: scale(1.05);
    }

    .digit-input.has-error {
      border-color: var(--error, #EF4444);
      color: var(--error, #EF4444);
    }
    
    .digit-input.has-error:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--error, #EF4444);
      font-size: 14px;
      font-weight: 500;
      animation: fadeIn 0.3s ease;
    }

    /* Actions */
    .actions {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .btn-primary {
      width: 100%;
      height: 48px;
      background: var(--accent, #00BFEA);
      color: white;
      border: none;
      border-radius: var(--radius-md, 12px);
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-hover, #0099C4);
      transform: translateY(-1px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(1px);
    }

    .btn-primary:disabled {
      background: var(--border, #E5E8ED);
      color: var(--text-muted, #8899A6);
      cursor: not-allowed;
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      animation: spin 1s linear infinite;
    }

    .resend-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-resend {
      background: none;
      border: none;
      color: var(--text-secondary, #536471);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s ease;
    }

    .btn-resend:hover:not(:disabled) {
      color: var(--accent, #00BFEA);
    }

    .btn-resend:disabled {
      color: var(--text-muted, #8899A6);
      cursor: not-allowed;
    }

    .timer {
      font-size: 14px;
      color: var(--text-muted, #8899A6);
      font-variant-numeric: tabular-nums;
      animation: pulse 1s infinite alternate;
    }

    /* Back Link */
    .btn-back {
      background: none;
      border: none;
      color: var(--text-secondary, #536471);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      transition: color 0.2s ease;
    }

    .btn-back:hover {
      color: var(--text-primary, #0F1419);
    }

    /* Animations */
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      from { opacity: 0.7; }
      to { opacity: 1; }
    }
  `]
})
export class RegisterVerifyEmailComponent implements OnInit, OnDestroy {
  @Input() email = '';
  @Output() confirm = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  // State
  digits: string[] = ['', '', '', '', '', ''];
  isLoading = signal(false);
  isError = signal(false);
  cooldown = signal(30);

  private timerInterval: any;
  
  // Inject ToastService (mocked implementation if missing in app)
  // private toast = inject(ToastService, { optional: true });

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    if (typeof window === 'undefined') return;
    this.cooldown.set(30);
    this.timerInterval = setInterval(() => {
      if (this.cooldown() > 0) {
        this.cooldown.update(val => val - 1);
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  isFormValid(): boolean {
    return this.digits.every(d => d !== '');
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    this.isError.set(false);

    // Only allow numbers
    if (/[^0-9]/.test(value)) {
      input.value = this.digits[index];
      return;
    }

    this.digits[index] = value;

    // Auto-advance
    if (value && index < 5) {
      this.focusInput(index + 1);
    }
    
    if (this.isFormValid()) {
      // Optional: Auto-verify when full
      // this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text/plain') || '';
    const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
    
    if (numericData) {
      this.isError.set(false);
      
      for (let i = 0; i < numericData.length; i++) {
        this.digits[i] = numericData[i];
      }
      
      // Focus last filled input or next empty one
      const focusIndex = Math.min(numericData.length, 5);
      setTimeout(() => this.focusInput(focusIndex));
      
      if (this.isFormValid()) {
        // Optional auto trigger
      }
    }
  }

  onFocus(index: number) {
    setTimeout(() => {
      const input = this.digitInputs.toArray()[index].nativeElement;
      input.select();
    });
  }

  private focusInput(index: number) {
    const inputs = this.digitInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  verifyCode() {
    if (!this.isFormValid()) return;
    
    this.isLoading.set(true);
    const code = this.digits.join('');
    
    // Simulate API call for demonstration, or let parent handle
    // If parent handles async, they might need to update a signal or we just emit
    setTimeout(() => {
      this.confirm.emit(code);
      this.isLoading.set(false);
    }, 1000);
  }

  resendCode() {
    if (this.cooldown() > 0) return;
    
    this.startTimer();
    this.isError.set(false);
    this.digits = ['', '', '', '', '', ''];
    this.focusInput(0);
    
    // if (this.toast) {
    //   this.toast.success('Código reenviado com sucesso!');
    // } else {
      console.log('Toast: Código reenviado com sucesso!');
    // }
  }

  onBack() {
    this.back.emit();
  }
}
