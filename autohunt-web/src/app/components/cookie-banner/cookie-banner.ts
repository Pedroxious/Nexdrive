import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="cookie-banner-container" *ngIf="isVisible()">
      <div class="cookie-banner-content">
        <div class="cookie-text-wrap">
          <span class="cookie-icon">🍪</span>
          <span class="cookie-text" *ngIf="langService.currentLang() === 'pt'">
            Utilizamos cookies essenciais e tecnologias semelhantes de acordo com a nossa
            <a routerLink="/legal/privacidade" (click)="onPrivacyClick()" class="privacy-link">Política de Privacidade</a>
            e, ao continuar navegando, você concorda com estas condições.
          </span>
          <span class="cookie-text" *ngIf="langService.currentLang() === 'en'">
            We use essential cookies and similar technologies according to our
            <a routerLink="/legal/privacidade" (click)="onPrivacyClick()" class="privacy-link">Privacy Policy</a>
            and, by continuing to browse, you agree to these conditions.
          </span>
        </div>

        <div class="cookie-actions">
          <button class="accept-btn clickable" (click)="acceptConsent()">
            OK
          </button>
          <button class="close-btn clickable" (click)="closeTemporarily()" [title]="langService.currentLang() === 'pt' ? 'Fechar aviso' : 'Close notice'">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-banner-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: rgba(10, 18, 32, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(0, 191, 234, 0.25);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
      padding: 12px 24px;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cookie-banner-content {
      max-width: 1350px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .cookie-text-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cookie-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .cookie-text {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13.5px;
      line-height: 1;
      color: rgba(255, 255, 255, 0.9);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .privacy-link {
      color: var(--accent, #00BFFF);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s;

      &:hover {
        color: #38BDF8;
      }
    }

    .cookie-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .accept-btn {
      padding: 7px 22px;
      border-radius: 8px;
      border: none;
      background: var(--accent, #00BFFF);
      color: #0A1628;
      font-family: 'Outfit', sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;

      &:hover {
        background: #38BDF8;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0, 191, 234, 0.4);
      }
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #FFFFFF;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 900px) {
      .cookie-text-wrap {
        white-space: normal;
      }
      .cookie-text {
        white-space: normal;
        line-height: 1.4;
      }
    }

    @media (max-width: 640px) {
      .cookie-banner-container {
        padding: 10px 14px;
      }
      .cookie-banner-content {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      .cookie-actions {
        justify-content: flex-end;
      }
      .accept-btn {
        flex: 1;
        text-align: center;
        padding: 8px 16px;
      }
    }
  `]
})
export class CookieBannerComponent implements OnInit {
  private readonly STORAGE_KEY = 'nexdrive_cookie_consent';
  langService = inject(LanguageService);

  private isAccepted = signal(false);
  private isClosedTemp = signal(false);

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const consent = localStorage.getItem(this.STORAGE_KEY);
        if (consent === 'accepted') {
          this.isAccepted.set(true);
        }
      } catch {}
    }
  }

  isVisible(): boolean {
    return !this.isAccepted() && !this.isClosedTemp();
  }

  acceptConsent(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, 'accepted');
      } catch {}
    }
    this.isAccepted.set(true);
  }

  closeTemporarily(): void {
    this.isClosedTemp.set(true);
  }

  onPrivacyClick(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }
}
