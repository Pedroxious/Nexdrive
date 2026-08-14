import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="privacy-document">
      <header class="doc-header">
        <h1 class="doc-title">Central de Ajuda e Suporte Nexdrive</h1>
        <p class="doc-subtitle">
          Encontre orientações detalhadas sobre como funcionam nossas reservas, políticas de combustível, guias de retirada e assistência 24h.
        </p>
      </header>

      <hr class="divider" />

      <section class="doc-section">
        <h2>Tópicos Principais</h2>
        <div class="topics-grid">
          <div class="topic-card">
            <h3>🚗 Como Fazer uma Reserva</h3>
            <p>Passo a passo simples para pesquisar por cidade, escolher a categoria desejada e confirmar pelo aplicativo ou site.</p>
          </div>
          <div class="topic-card">
            <h3>🛡️ Proteções e Seguros</h3>
            <p>Entenda a cobertura contra colisões (CDW), opção de franquia zero e proteção a terceiros inclusas nos planos.</p>
          </div>
          <div class="topic-card">
            <h3>📞 Assistência 24 Horas</h3>
            <p>Canais diretos de emergência em caso de pane mecânica, sinistro ou guincho em todo o território nacional.</p>
          </div>
          <div class="topic-card">
            <h3>💳 Pagamentos e Faturamento</h3>
            <p>Informações sobre pré-autorização no cartão de crédito, caução de garantia e reembolso em cancelamentos.</p>
          </div>
        </div>
      </section>
    </article>
  `,
  styles: [`
    .privacy-document { font-family: 'Inter', system-ui, sans-serif; color: #1E293B; line-height: 1.7; }
    .doc-header { margin-bottom: 24px; }
    .doc-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; }
    .doc-subtitle { font-size: 15px; color: #475569; }
    .divider { border: none; border-top: 1px solid #E2E8F0; margin: 32px 0; }
    .doc-section { margin-bottom: 40px; h2 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 20px; } }
    .topics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .topic-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; h3 { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 8px; } p { font-size: 13.5px; color: #475569; margin: 0; } }
  `]
})
export class HelpComponent {}
