import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card animate-in">
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
                class="form-input"
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
                class="form-input"
              >
           </div>

           <button type="submit" class="auth-btn" [disabled]="isLoading() || !loginForm.valid">
              {{ isLoading() ? 'Entrando...' : 'Entrar' }}
           </button>
        </form>

        <div class="auth-footer">
           <p>Não tem uma conta? <a routerLink="/register">Cadastre-se</a></p>
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
      &:hover {
        color: var(--accent-hover);
      }
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
export class LoginComponent {
  email = '';
  password = '';
  isLoading = signal(false);

  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  onLogin() {
    this.isLoading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Login realizado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toast.error(err.status === 401 ? 'E-mail ou senha incorretos' : 'Erro no servidor');
        this.isLoading.set(false);
      }
    });
  }
}
