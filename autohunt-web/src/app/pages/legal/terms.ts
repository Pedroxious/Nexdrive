import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="privacy-document">
      <header class="doc-header">
        <div class="doc-meta">
          <span class="meta-tag">Documento Oficial</span>
          <span class="meta-date">Última atualização: 14 de Agosto de 2026</span>
        </div>
        <h1 class="doc-title">Termos e Condições Gerais de Uso — Nexdrive</h1>
        <p class="doc-subtitle">
          Regras e condições contratuais aplicáveis à utilização da plataforma Nexdrive, criação de cadastro, reservas e locação de veículos automotores em território nacional.
        </p>
      </header>

      <hr class="divider" />

      <section class="doc-section">
        <h2>1. Condições de Elegibilidade do Condutor</h2>
        <p>Para reservar e conduzir um veículo alugado via Nexdrive, o Usuário concorda e declara atender aos seguintes requisitos obrigatórios:</p>
        <ul class="styled-list">
          <li>Possuir idade mínima de 21 (vinte e um) anos completos.</li>
          <li>Possuir Carteira Nacional de Habilitação (CNH) válida e definitiva há pelo menos 2 (dois) anos.</li>
          <li>Apresentar cartão de crédito de titularidade do próprio condutor com limite disponível para caução de garantia.</li>
        </ul>
      </section>

      <section class="doc-section">
        <h2>2. Reservas, Pagamentos e Cancelamento</h2>
        <p>A confirmação da reserva ocorre mediante a aprovação do pagamento das diárias selecionadas e validação da CNH.</p>
        <ul class="styled-list">
          <li><strong>Cancelamento Gratuito:</strong> Cancelamentos efetuados com até 24 horas de antecedência do horário agendado para retirada não possuem cobrança de taxa.</li>
          <li><strong>Multas por Atraso:</strong> O atraso na devolução do veículo sujeito a cobrança de hora adicional conforme tabela vigente no contrato de locação.</li>
        </ul>
      </section>

      <section class="doc-section">
        <h2>3. Coberturas e Proteções</h2>
        <p>Todos os veículos contratados na modalidade padrão contam com Proteção Básica (CDW) contra colisão, furto, roubo e danos a terceiros com franquia estipulada no comprovante da reserva.</p>
      </section>

      <section class="doc-section">
        <h2>4. Contato Legal</h2>
        <p>Dúvidas em relação aos termos contratuais de locação podem ser enviadas para <a href="mailto:juridico@nexdrive.com.br" class="dpo-email">juridico&#64;nexdrive.com.br</a>.</p>
      </section>
    </article>
  `,
  styles: [`
    .privacy-document { font-family: 'Inter', system-ui, sans-serif; color: #1E293B; line-height: 1.7; }
    .doc-header { margin-bottom: 24px; }
    .doc-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .meta-tag { background: #E0F2FE; color: #0369A1; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
    .meta-date { font-size: 13px; color: #64748B; font-weight: 500; }
    .doc-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; }
    .doc-subtitle { font-size: 15px; color: #475569; }
    .divider { border: none; border-top: 1px solid #E2E8F0; margin: 32px 0; }
    .doc-section { margin-bottom: 40px; h2 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 16px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; } p { font-size: 14.5px; color: #334155; margin-bottom: 14px; } }
    .styled-list { padding-left: 20px; li { font-size: 14px; color: #334155; margin-bottom: 8px; } }
    .dpo-email { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #0284C7; text-decoration: none; }
  `]
})
export class TermsComponent {}
