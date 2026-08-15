import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="legal-portal">
      <!-- Legal Header -->
      <header class="legal-header">
        <div class="legal-header-container">
          <div class="header-top-row">
            <a routerLink="/" class="back-link clickable">
              <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
              <span>{{ langService.t('legal.back_to_site') }}</span>
            </a>
            <span class="portal-badge">{{ langService.t('legal.portal_badge') }}</span>
          </div>

          <div class="header-main-row">
            <a class="brand-wrap clickable" routerLink="/legal/privacidade">
              <img src="favicon/favicon-32x32.png" alt="Nexdrive Logo" class="brand-logo" width="28" height="28" />
              <div class="brand-titles">
                <span class="brand-name">Nex<span class="accent">drive</span></span>
                <span class="brand-sub">Privacidade & Termos</span>
              </div>
            </a>
          </div>

          <!-- Legal Nav Tabs -->
          <nav class="legal-tabs" role="tablist">
            <a routerLink="/legal/privacidade" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="tab-item clickable" role="tab">
              <lucide-icon name="shield" [size]="16"></lucide-icon>
              <span>{{ langService.t('legal.privacy') }}</span>
            </a>
            <a routerLink="/legal/termos" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="tab-item clickable" role="tab">
              <lucide-icon name="file-text" [size]="16"></lucide-icon>
              <span>{{ langService.t('legal.terms') }}</span>
            </a>
            <a routerLink="/legal/ajuda" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="tab-item clickable" role="tab">
              <lucide-icon name="help-circle" [size]="16"></lucide-icon>
              <span>{{ langService.t('legal.help') }}</span>
            </a>
            <a routerLink="/legal/faq" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="tab-item clickable" role="tab">
              <lucide-icon name="help-circle" [size]="16"></lucide-icon>
              <span>{{ langService.t('legal.faq') }}</span>
            </a>
            <a routerLink="/legal/forum" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" class="tab-item clickable tab-forum" role="tab">
              <lucide-icon name="message-square" [size]="16"></lucide-icon>
              <span>{{ langService.t('legal.forum') }}</span>
            </a>
          </nav>
        </div>
      </header>

      <!-- Main Body Container -->
      <main class="legal-body" [class.is-forum]="isForumRoute()">
        <div class="legal-content-card" [class.is-forum-card]="isForumRoute()">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Legal Footer -->
      <footer class="legal-footer">
        <div class="legal-footer-container">
          <p>© 2026 Nexdrive Mobilidade S.A. {{ langService.t('footer.rights') }} CNPJ 00.000.000/0001-00.</p>
          <p class="sub-text">Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .legal-portal {
      min-height: 100vh;
      background-color: var(--bg-main, #F8FAFC);
      color: var(--text-primary, #0F172A);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* ── Header ── */
    .legal-header {
      background: var(--surface, #FFFFFF);
      border-bottom: 1px solid var(--border, #E2E8F0);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .legal-header-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 16px 24px 0 24px;
    }

    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent, #0284C7);
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover {
        color: var(--accent-hover, #0369A1);
        text-decoration: underline;
      }
    }

    .portal-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #64748B);
      background: var(--surface-secondary, #F1F5F9);
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid var(--border, #E2E8F0);
    }

    .header-main-row {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .brand-logo {
      border-radius: 6px;
    }

    .brand-titles {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary, #0F172A);
      line-height: 1.1;

      .accent {
        color: var(--accent, #0284C7);
      }
    }

    .brand-sub {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary, #64748B);
    }

    /* ── Tabs Navigation ── */
    .legal-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 12px;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .tab-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-secondary, #475569);
      text-decoration: none;
      background: var(--surface-secondary, #F1F5F9);
      border: 1.5px solid var(--border, #E2E8F0);
      border-radius: 10px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      cursor: pointer;

      &:hover {
        color: var(--text-primary, #0F172A);
        background: var(--surface-hover, #E2E8F0);
        border-color: var(--accent, #0284C7);
        transform: translateY(-1px);
      }

      &.active {
        color: #FFFFFF !important;
        background: var(--accent, #0284C7) !important;
        border-color: var(--accent, #0284C7) !important;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
      }
    }

    /* ── Body ── */
    .legal-body {
      flex: 1;
      max-width: 1360px;
      width: 100%;
      margin: 24px auto;
      padding: 0 24px;

      &.is-forum {
        max-width: 1360px;
        margin: 16px auto;
        padding: 0 16px;
      }
    }

    .legal-content-card {
      background: var(--surface, #FFFFFF);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 14px;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
      padding: 40px;
      transition: background 0.3s ease, border-color 0.3s ease;

      &.is-forum-card {
        padding: 0;
        background: transparent;
        border: none;
        box-shadow: none;
      }
    }

    /* ── Footer ── */
    .legal-footer {
      background: var(--surface-secondary, #F1F5F9);
      border-top: 1px solid var(--border, #E2E8F0);
      padding: 24px;
      margin-top: auto;
      text-align: center;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .legal-footer-container {
      max-width: 1360px;
      margin: 0 auto;

      p {
        font-size: 13px;
        color: var(--text-secondary, #64748B);
        margin: 0 0 4px 0;
      }

      .sub-text {
        font-size: 12px;
        color: var(--text-muted, #94A3B8);
      }
    }

    /* ── Dark Theme Overrides ── */
    :host-context([data-theme='dark']) {
      .tab-item {
        background: #111C30;
        border-color: #1E2D4A;
        color: #94A3B8;

        &:hover {
          background: #1A2942;
          color: #F8FAFC;
          border-color: #00BFEA;
        }

        &.active {
          background: #00BFEA !important;
          color: #060D1A !important;
          border-color: #00BFEA !important;
          box-shadow: 0 4px 14px rgba(0, 191, 234, 0.4);
        }
      }
    }

    @media (max-width: 768px) {
      .legal-header-container {
        padding: 12px 16px 0 16px;
      }
      .legal-body {
        margin: 16px auto;
        padding: 0 12px;

        &.is-forum {
          padding: 0 8px;
        }
      }
      .legal-content-card {
        padding: 20px 16px;
        border-radius: 10px;
      }
      .tab-item {
        padding: 8px 14px;
        font-size: 13px;
      }
    }
  `]
})
export class LegalLayoutComponent implements OnInit {
  private router = inject(Router);
  langService = inject(LanguageService);

  ngOnInit() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  isForumRoute(): boolean {
    return this.router.url.includes('/legal/forum');
  }
}
