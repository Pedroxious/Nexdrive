import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

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
              <span>Voltar ao site principal</span>
            </a>
            <span class="portal-badge">Central de Documentação Legal</span>
          </div>

          <div class="header-main-row">
            <div class="brand-wrap clickable" routerLink="/legal/privacidade">
              <img src="favicon/favicon-32x32.png" alt="Nexdrive Logo" class="brand-logo" width="28" height="28" />
              <div class="brand-titles">
                <span class="brand-name">Nex<span class="accent">drive</span></span>
                <span class="brand-sub">Privacidade & Termos</span>
              </div>
            </div>
          </div>

          <!-- Legal Nav Tabs -->
          <nav class="legal-tabs">
            <a routerLink="/legal/privacidade" routerLinkActive="active" class="tab-item">
              <lucide-icon name="shield" [size]="16"></lucide-icon>
              <span>Política de Privacidade</span>
            </a>
            <a routerLink="/legal/termos" routerLinkActive="active" class="tab-item">
              <lucide-icon name="file-text" [size]="16"></lucide-icon>
              <span>Termos de Uso</span>
            </a>
            <a routerLink="/legal/ajuda" routerLinkActive="active" class="tab-item">
              <lucide-icon name="help-circle" [size]="16"></lucide-icon>
              <span>Central de Ajuda</span>
            </a>
            <a routerLink="/legal/faq" routerLinkActive="active" class="tab-item">
              <lucide-icon name="help-circle" [size]="16"></lucide-icon>
              <span>Perguntas Frequentes</span>
            </a>
            <a routerLink="/legal/forum" routerLinkActive="active" class="tab-item">
              <lucide-icon name="message-square" [size]="16"></lucide-icon>
              <span>Fórum & Comunidade</span>
            </a>
          </nav>
        </div>
      </header>

      <!-- Main Body Container -->
      <main class="legal-body">
        <div class="legal-content-card">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Legal Footer -->
      <footer class="legal-footer">
        <div class="legal-footer-container">
          <p>© 2026 Nexdrive Mobilidade S.A. Todos os direitos reservados. CNPJ 00.000.000/0001-00.</p>
          <p class="sub-text">Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .legal-portal {
      min-height: 100vh;
      background-color: #F8FAFC;
      color: #0F172A;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .legal-header {
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .legal-header-container {
      max-width: 1100px;
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
      color: #2563EB;
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover {
        color: #1D4ED8;
        text-decoration: underline;
      }
    }

    .portal-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748B;
      background: #F1F5F9;
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
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
      color: #0F172A;
      line-height: 1.1;

      .accent {
        color: #0284C7;
      }
    }

    .brand-sub {
      font-size: 12px;
      font-weight: 500;
      color: #64748B;
    }

    /* ── Tabs Navigation ── */
    .legal-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      border-bottom: 1px solid transparent;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .tab-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      color: #64748B;
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        color: #0F172A;
        background: #F8FAFC;
      }

      &.active {
        color: #0284C7;
        border-bottom-color: #0284C7;
        background: transparent;
      }
    }

    .soon-tag {
      font-size: 10px;
      font-weight: 700;
      background: #E0F2FE;
      color: #0369A1;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    /* ── Body ── */
    .legal-body {
      flex: 1;
      max-width: 1100px;
      width: 100%;
      margin: 32px auto;
      padding: 0 24px;
    }

    .legal-content-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      padding: 48px;
    }

    /* ── Footer ── */
    .legal-footer {
      background: #F1F5F9;
      border-top: 1px solid #E2E8F0;
      padding: 24px;
      margin-top: 48px;
      text-align: center;
    }

    .legal-footer-container {
      max-width: 1100px;
      margin: 0 auto;

      p {
        font-size: 13px;
        color: #64748B;
        margin: 0 0 4px 0;
      }

      .sub-text {
        font-size: 12px;
        color: #94A3B8;
      }
    }

    @media (max-width: 768px) {
      .legal-header-container {
        padding: 12px 16px 0 16px;
      }
      .legal-body {
        margin: 16px auto;
        padding: 0 12px;
      }
      .legal-content-card {
        padding: 24px 18px;
        border-radius: 8px;
      }
      .tab-item {
        padding: 10px 12px;
        font-size: 13px;
      }
    }
  `]
})
export class LegalLayoutComponent {}
