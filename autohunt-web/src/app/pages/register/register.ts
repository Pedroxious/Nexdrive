import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
   selector: 'app-register',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterLink],
   template: `
    <div class="auth-page">
      <div class="auth-card animate-in">
        <div class="logo-wrapper">
          <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
        </div>

        <div class="auth-header">
           <h1>Criar Conta</h1>
           <p>Junte-se ao marketplace Nexdrive</p>
        </div>

        <form (ngSubmit)="onRegister()" #regForm="ngForm">
           <div class="input-group">
              <label for="name-input">Nome Completo</label>
              <input 
                id="name-input"
                type="text" 
                [(ngModel)]="fullName" 
                name="fullName" 
                class="form-input" 
                placeholder="João Silva" 
                required
              >
           </div>

           <div class="input-group">
              <label for="email-input">E-mail</label>
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

           <div class="input-group">
              <label for="password-input">Senha</label>
              <input 
                id="password-input"
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                class="form-input"
              >
           </div>

           <button type="submit" class="auth-btn" [disabled]="isLoading() || !regForm.valid">
              {{ isLoading() ? 'Criando conta...' : 'Criar Conta' }}
           </button>
        </form>

        <div class="auth-footer">
           <p>Já tem uma conta? <a routerLink="/login">Entrar</a></p>
        </div>
      </div>
    </div>
  `,
   styles: [`
    .auth-page { 
      min-height: 80vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 40px 20px; 
    }
    
    .auth-card { 
      width: 100%; 
      max-width: 440px; 
      padding: 48px; 
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg); 
      box-shadow: var(--shadow-lg);
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .logo-wrapper { 
      margin-bottom: 24px;
      .logo-text {
        font-family: 'Outfit', sans-serif;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-primary);
      }
      .logo-accent {
        color: var(--accent);
      }
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
      
      label { 
        display: block; 
        font-family: 'Inter', sans-serif;
        font-size: 13px; 
        font-weight: 600; 
        margin-bottom: 8px; 
        color: var(--text-secondary);
      } 
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
      transition: all 0.2s ease;
      
      &::placeholder {
        color: var(--text-muted);
      }
      
      &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
      }
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
      
      &:hover:not(:disabled) {
        background-color: var(--accent-hover);
      }
      
      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
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
  `]
})
export class RegisterComponent {
   fullName = '';
   email = '';
   password = '';
   isLoading = signal(false);

   private auth = inject(AuthService);
   private toast = inject(ToastService);
   private router = inject(Router);

   onRegister() {
      this.isLoading.set(true);
      this.auth.register({ fullName: this.fullName, email: this.email, password: this.password }).subscribe({
         next: () => {
            this.toast.success('Conta criada com sucesso! Faça login.');
            this.router.navigate(['/login']);
         },
         error: (err) => {
            this.toast.error(err.error?.error || 'Erro ao criar conta');
            this.isLoading.set(false);
         }
      });
   }
}
