import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forum-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="privacy-document">
      <header class="doc-header text-center">
        <span class="badge-tag">Em Desenvolvimento</span>
        <h1 class="doc-title">Fórum & Comunidade Nexdrive</h1>
        <p class="doc-subtitle">
          Estamos construindo um espaço de troca de experiências, relatos de viagens e recomendações de rotas entre motoristas e clientes Nexdrive.
        </p>
      </header>

      <hr class="divider" />

      <section class="doc-section placeholder-box">
        <div class="icon-wrap">💬</div>
        <h2>O Fórum da Comunidade estará disponível em breve!</h2>
        <p>
          Esta seção está reservada na estrutura do nosso portal institucional para abrigar tópicos de discussão, dúvidas da comunidade e dicas de mobilidade.
        </p>
        <a routerLink="/legal/privacidade" class="btn-primary">Ver Política de Privacidade</a>
      </section>
    </article>
  `,
  styles: [`
    .privacy-document { font-family: 'Inter', system-ui, sans-serif; color: #1E293B; line-height: 1.7; }
    .text-center { text-align: center; }
    .badge-tag { background: #E0F2FE; color: #0284C7; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; display: inline-block; margin-bottom: 12px; }
    .doc-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; }
    .doc-subtitle { font-size: 15px; color: #475569; max-width: 600px; margin: 0 auto; }
    .divider { border: none; border-top: 1px solid #E2E8F0; margin: 32px 0; }
    .placeholder-box { background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 48px 24px; text-align: center; }
    .icon-wrap { font-size: 48px; margin-bottom: 16px; }
    h2 { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
    p { font-size: 14px; color: #64748B; max-width: 500px; margin: 0 auto 24px auto; }
    .btn-primary { display: inline-block; background: #0284C7; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 8px; text-decoration: none; transition: background 0.2s; &:hover { background: #0369A1; } }
  `]
})
export class ForumPlaceholderComponent {}
