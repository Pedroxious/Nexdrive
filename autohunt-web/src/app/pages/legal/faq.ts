import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="privacy-document">
      <header class="doc-header">
        <h1 class="doc-title">Perguntas Frequentes — Jurídico & Contratos</h1>
        <p class="doc-subtitle">
          Esclarecimentos sobre os aspectos legais, obrigações e políticas contratuais da locação no Nexdrive.
        </p>
      </header>

      <hr class="divider" />

      <section class="doc-section">
        @for (item of faqs; track item.q) {
          <div class="faq-item">
            <h3 class="faq-q">Q: {{ item.q }}</h3>
            <p class="faq-a">{{ item.a }}</p>
          </div>
        }
      </section>
    </article>
  `,
  styles: [`
    .privacy-document { font-family: 'Inter', system-ui, sans-serif; color: #1E293B; line-height: 1.7; }
    .doc-header { margin-bottom: 24px; }
    .doc-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; }
    .doc-subtitle { font-size: 15px; color: #475569; }
    .divider { border: none; border-top: 1px solid #E2E8F0; margin: 32px 0; }
    .doc-section { margin-bottom: 40px; }
    .faq-item { margin-bottom: 24px; border-bottom: 1px solid #F1F5F9; padding-bottom: 16px; }
    .faq-q { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
    .faq-a { font-size: 14.5px; color: #334155; margin: 0; }
  `]
})
export class LegalFaqComponent {
  faqs = [
    {
      q: 'Quais documentos preciso apresentar no momento da retirada?',
      a: 'É obrigatório apresentar CNH física ou digital válida de condutor principal habilitado há pelo menos 2 anos, RG/CPF e cartão de crédito físico do titular da reserva.'
    },
    {
      q: 'Como funciona a política de combustível?',
      a: 'O veículo é entregue com tanque cheio e deve ser devolvido com a mesma quantidade. Caso haja diferença, a recarga será calculada conforme tabela do contrato.'
    },
    {
      q: 'Posso adicionar um condutor adicional?',
      a: 'Sim, condutores adicionais podem ser incluídos durante o fluxo de reserva mediante apresentação de CNH válida e atendimento aos critérios de idade prévios.'
    },
    {
      q: 'Como solicitar o cancelamento e reembolso da reserva?',
      a: 'O cancelamento pode ser efetuado no painel "Minhas Reservas". Cancelamentos realizados até 24h antes do horário de retirada não possuem retenção de valores.'
    }
  ];
}
