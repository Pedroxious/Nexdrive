import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="contact-container animate-in">
      <div class="header">
        <h1>{{ langService.t('contact.title') }}</h1>
        <p>{{ langService.t('contact.subtitle') }}</p>
      </div>

      <div class="contact-grid">
        <div class="info-side">
          <div class="info-card glass">
            <span class="icon">📍</span>
            <div class="meta">
              <strong>{{ langService.currentLang() === 'pt' ? 'Endereço Sede' : 'Headquarters Address' }}</strong>
              <p>Av. Paulista, 1000 - Bela Vista<br>São Paulo, SP</p>
            </div>
          </div>

          <div class="info-card glass">
            <span class="icon">📞</span>
            <div class="meta">
              <strong>{{ langService.currentLang() === 'pt' ? 'Telefone' : 'Phone' }}</strong>
              <p>0800 123 4567<br>(11) 4004-9000</p>
            </div>
          </div>

          <div class="info-card glass">
            <span class="icon">✉️</span>
            <div class="meta">
              <strong>E-mail</strong>
              <p>suporte&#64;nexdrive.com<br>comercial&#64;nexdrive.com</p>
            </div>
          </div>
        </div>

        <form class="form-side glass">
          <div class="group">
            <label>{{ langService.t('contact.name') }}</label>
            <input type="text" class="glass-input" [placeholder]="langService.t('contact.name')">
          </div>
          <div class="group">
            <label>{{ langService.t('contact.email') }}</label>
            <input type="email" class="glass-input" [placeholder]="langService.t('contact.email')">
          </div>
          <div class="group">
            <label>{{ langService.t('contact.message') }}</label>
            <textarea class="glass-input" rows="5" [placeholder]="langService.t('contact.message')"></textarea>
          </div>
          <button type="submit" class="submit-btn clickable">{{ langService.t('contact.send') }}</button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .contact-container { max-width: 1000px; margin: 0 auto; padding: 60px 20px; }
    .header { text-align: center; margin-bottom: 50px; h1 { font-size: 36px; font-weight: 900; margin-bottom: 12px; } p { color: var(--text-secondary); font-size: 18px; } }
    
    .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }
    
    .info-side { display: flex; flex-direction: column; gap: 20px; }
    .info-card {
      display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: var(--radius-lg);
      .icon { font-size: 28px; }
      .meta { strong { display: block; font-size: 16px; margin-bottom: 4px; } p { color: var(--text-secondary); font-size: 14px; margin: 0; } }
    }

    .form-side {
      padding: 36px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 20px;
      .group { display: flex; flex-direction: column; gap: 8px; label { font-size: 14px; font-weight: 700; color: var(--text-secondary); } }
      .glass-input {
        background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; color: var(--text-primary); outline: none; font-size: 15px;
        &:focus { border-color: var(--accent); }
      }
      .submit-btn {
        background: var(--accent); color: white; border: none; padding: 14px; border-radius: var(--radius-md); font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.2s;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 14px var(--accent-light); }
      }
    }

    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent {
  langService = inject(LanguageService);
}
