import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

         <div class="divider">
            <span>ou</span>
         </div>

         <button type="button" class="google-btn" [disabled]="isLoading()" (click)="loginWithGoogle()">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
               <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.79 5.79 0 0 1 8.2 12.725a5.79 5.79 0 0 1 5.79-5.79c1.498 0 2.861.565 3.905 1.485l3.059-3.059C19.1 3.561 16.735 2.5 13.99 2.5a9.725 9.725 0 0 0-9.725 9.725 9.725 9.725 0 0 0 9.725 9.725c5.73 0 9.135-4.03 9.135-9.283 0-.603-.048-1.066-.145-1.38H12.24Z"/>
            </svg>
            <span>Entrar com o Google</span>
         </button>

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
      span {
        padding: 0 10px;
      }
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
      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .google-icon {
        flex-shrink: 0;
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
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = signal(false);

  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const oauth2 = params['oauth2'];
      const error = params['error'];

      if (error) {
        this.toast.error('Falha na autenticação: ' + error);
      }

      if (oauth2 === 'success' || token) {
        this.isLoading.set(true);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.auth.token.set(null);
        this.auth.currentUser.set(null);
        this.auth.isLoggedIn.set(false);

        if (token) {
          localStorage.setItem('token', token);
          this.auth.token.set(token);
        }
        this.auth.getMe().subscribe({
          next: () => {
            this.toast.success('Login realizado com sucesso!');
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.toast.error('Erro ao autenticar com o Google');
            this.isLoading.set(false);
            localStorage.removeItem('token');
          }
        });
      }
    });
  }

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

  loginWithGoogle() {
    window.location.href = '/oauth2/authorization/google';
  }
}
