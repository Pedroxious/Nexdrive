import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast';
import { RegisterStep1Component } from './register-step1';
import { RegisterVerifyEmailComponent } from './register-verify-email';
import { RegisterAdditionalInfoComponent } from './register-additional-info';

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
    <div class="auth-page">
      <!-- Step 1: Basic Info -->
      @if (currentStep() === 'step1') {
        <app-register-step1 (next)="onStep1Next($event)"></app-register-step1>
      }

      <!-- Step 2: Verification Code -->
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
    </div>
  `,
  styles: [`
    .auth-page { 
      min-height: 80vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 40px 20px; 
      background-color: var(--bg-main);
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

  private toast = inject(ToastService);
  private router = inject(Router);

  onStep1Next(data: any) {
    this.tempUser = { ...data };
    this.currentStep.set('verify-email');
  }

  onVerifyEmailBack() {
    this.currentStep.set('step1');
  }

  onVerifyEmailConfirm(code: string) {
    this.currentStep.set('additional-info');
  }

  onAdditionalInfoFinish(cpf: string | null) {
    if (cpf) {
      this.tempUser.cpf = cpf;
    }
    
    // For now: mock finalization and redirect
    this.toast.success('Cadastro realizado com sucesso! Faça login.');
    this.router.navigate(['/login']);
  }
}
