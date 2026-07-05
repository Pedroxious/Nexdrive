import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Instagram, Twitter, Facebook, Linkedin, Send, ShieldCheck, Lock } from 'lucide-angular';
import { ToastService } from '../../core/services/toast';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="brand-col">
            <div class="footer-logo">
              <span class="logo-icon">
                <img src="favicon/favicon-32x32.png" alt="Nexdrive" width="22" height="22" />
              </span>
              <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
            </div>
            <p class="brand-desc">A maior e melhor plataforma de reserva de veículos do Brasil. Experiência premium em cada quilômetro.</p>
            <div class="social-row">
              <button class="social-btn clickable" (click)="showMsg('Instagram')" title="Instagram">
                <lucide-icon name="instagram" [size]="18"></lucide-icon>
              </button>
              <button class="social-btn clickable" (click)="showMsg('Twitter / X')" title="Twitter">
                <lucide-icon name="twitter" [size]="18"></lucide-icon>
              </button>
              <button class="social-btn clickable" (click)="showMsg('Facebook')" title="Facebook">
                <lucide-icon name="facebook" [size]="18"></lucide-icon>
              </button>
              <button class="social-btn clickable" (click)="showMsg('LinkedIn')" title="LinkedIn">
                <lucide-icon name="linkedin" [size]="18"></lucide-icon>
              </button>
            </div>
          </div>

          <div class="links-col">
            <h4>Empresa</h4>
            <ul>
              <li><a routerLink="/about">Sobre nós</a></li>
              <li><a routerLink="/sell-car">Anunciar Veículo</a></li>
              <li><a (click)="showMsg('Blog')">Blog</a></li>
              <li><a (click)="showMsg('Parceiros')">Parceiros</a></li>
            </ul>
          </div>

          <div class="links-col">
            <h4>Suporte</h4>
            <ul>
              <li><a routerLink="/faq">Central de Ajuda</a></li>
              <li><a routerLink="/contact">Contato</a></li>
              <li><a routerLink="/privacy">Privacidade</a></li>
              <li><a routerLink="/terms">Termos de Uso</a></li>
            </ul>
          </div>

          <div class="newsletter-col">
            <h4>Newsletter</h4>
            <p>Receba ofertas exclusivas e novidades.</p>
            <div class="newsletter-form">
              <input type="email" placeholder="Seu melhor e-mail" class="newsletter-input" #newsEmail>
              <button class="newsletter-btn clickable" (click)="subscribeNews(newsEmail.value); newsEmail.value = ''">
                <lucide-icon name="send" [size]="18"></lucide-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 Nexdrive. Todos os direitos reservados.</p>
          <div class="footer-badges">
            <span class="badge-item">
              <lucide-icon name="shield-check" [size]="14"></lucide-icon> Ambiente Seguro
            </span>
            <span class="badge-item">
              <lucide-icon name="lock" [size]="14"></lucide-icon> SSL Criptografado
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    .footer {
      background: #111318;
      color: #C8CDD5;
      margin-top: 80px;
    }

    [data-theme='dark'] .footer {
      background: #080A0E;
      border-top: 1px solid #1C1F27;
    }

    .footer-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 60px 24px 24px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
      gap: 48px;
      margin-bottom: 48px;
    }

    /* ── Brand ── */
    .footer-logo {
      display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
    }
    .logo-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      background: var(--accent); display: flex; align-items: center; justify-content: center;
      img { width: 22px; height: 22px; object-fit: contain; }
    }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px;
    }
    .logo-accent { color: var(--accent); }

    .brand-desc { font-size: 14px; line-height: 1.7; color: #8B98A5; margin-bottom: 20px; }

    .social-row { display: flex; gap: 8px; }
    .social-btn {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      color: #8B98A5;
      &:hover {
        background: var(--accent);
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 191, 234, 0.30);
      }
    }

    /* ── Links ── */
    .links-col {
      h4 {
        font-family: 'Outfit', sans-serif;
        font-size: 14px; font-weight: 700; color: #fff;
        text-transform: uppercase; letter-spacing: 0.5px;
        margin-bottom: 20px;
      }
      ul { list-style: none; }
      li {
        margin-bottom: 12px;
        a {
          font-size: 14px; color: #8B98A5; cursor: pointer;
          transition: color 0.2s, padding-left 0.2s;
          &:hover { color: var(--accent); padding-left: 4px; }
        }
      }
    }

    /* ── Newsletter ── */
    .newsletter-col {
      h4 {
        font-family: 'Outfit', sans-serif;
        font-size: 14px; font-weight: 700; color: #fff;
        text-transform: uppercase; letter-spacing: 0.5px;
        margin-bottom: 20px;
      }
      p { font-size: 14px; color: #8B98A5; line-height: 1.6; margin-bottom: 16px; }
    }

    .newsletter-form {
      display: flex; gap: 0;
      border-radius: var(--radius-sm); overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 0.2s;
      &:focus-within { border-color: var(--accent); }
    }
    .newsletter-input {
      flex: 1; padding: 12px 14px; background: rgba(255,255,255,0.04);
      border: none; color: #fff; font-size: 13px; font-weight: 500; outline: none;
      &::placeholder { color: #5C6B7A; }
    }
    .newsletter-btn {
      padding: 0 16px; background: var(--accent); display: flex; align-items: center;
      transition: all 0.2s;
      color: #fff;
      &:hover { background: var(--accent-hover); transform: translateX(2px); }
    }

    /* ── Bottom ── */
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 24px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
      p { font-size: 12px; color: #5C6B7A; }
    }

    .footer-badges {
      display: flex; gap: 20px;
    }
    .badge-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 600; color: #5C6B7A;
      lucide-icon { color: var(--accent); }
    }

    /* ── Responsive ── */
    @media (max-width: 992px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
    }
    @media (max-width: 600px) {
      .footer-grid { grid-template-columns: 1fr; gap: 32px; }
      .footer-bottom { flex-direction: column; text-align: center; }
    }
  `]
})
export class FooterComponent {
  toast = inject(ToastService);

  showMsg(item: string) {
    this.toast.info(`${item} estará disponível em breve!`);
  }

  subscribeNews(email: string) {
    if (email && email.trim() !== '') {
      this.toast.success('Obrigado por assinar nossa newsletter!');
    } else {
      this.toast.warning('Por favor, informe um e-mail válido.');
    }
  }
}
