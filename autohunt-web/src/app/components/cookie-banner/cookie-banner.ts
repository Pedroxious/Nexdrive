import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="cookie-banner-container" *ngIf="isVisible()">
      <div class="cookie-banner-content">
        <div class="cookie-text-wrap">
          <span class="cookie-icon">🍪</span>
          <p class="cookie-text">
            Utilizamos cookies essenciais e tecnologias semelhantes de acordo com a nossa
            <a routerLink="/legal/privacidade" class="privacy-link">Política de Privacidade</a>
            e, ao continuar navegando, você concorda com estas condições.
          </p>
        </div>

        <div class="cookie-actions">
          <button class="accept-btn clickable" (click)="acceptConsent()">
            OK
          </button>
          <button class="close-btn clickable" (click)="closeTemporarily()" title="Fechar aviso">
            <lucide-icon name="x" [size]="18"></lucide-icon>
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
      padding: 16px 24px;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cookie-banner-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .cookie-text-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .cookie-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .cookie-text {
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.88);
      margin: 0;
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
      gap: 12px;
      flex-shrink: 0;
    }

    .accept-btn {
      padding: 8px 24px;
      border-radius: 8px;
      border: none;
      background: var(--accent, #00BFFF);
      color: #0A1628;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
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
      width: 32px;
      height: 32px;
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

    @media (max-width: 768px) {
      .cookie-banner-container {
        padding: 14px 16px;
      }
      .cookie-banner-content {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
      }
      .cookie-actions {
        justify-content: flex-end;
      }
      .accept-btn {
        flex: 1;
        text-align: center;
        padding: 10px 16px;
      }
    }
  `]
})
export class CookieBannerComponent implements OnInit {
  private readonly STORAGE_KEY = 'nexdrive_cookie_consent';

  private isAccepted = signal(false);
  private isClosedTemp = signal(false);

  ngOnInit() {
    const consent = localStorage.getItem(this.STORAGE_KEY);
    if (consent === 'accepted') {
      this.isAccepted.set(true);
    }
  }

  isVisible(): boolean {
    return !this.isAccepted() && !this.isClosedTemp();
  }

  acceptConsent(): void {
    localStorage.setItem(this.STORAGE_KEY, 'accepted');
    this.isAccepted.set(true);
  }

  closeTemporarily(): void {
    // Closes only for the current view/session memory state.
    // Does NOT write to localStorage so on F5 or page navigation it re-appears.
    this.isClosedTemp.set(true);
  }
}
