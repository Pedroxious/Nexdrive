import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-faq',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="faq-container animate-in">
      <div class="header">
        <h1>Perguntas Frequentes</h1>
        <p>Tudo o que você precisa saber sobre a Nexdrive.</p>
      </div>

      <div class="faq-grid">
        @for (item of faqs; track item.q) {
          <div class="faq-item glass clickable" (click)="item.open = !item.open">
            <div class="question">
              <strong>{{ item.q }}</strong>
              <span class="icon">{{ item.open ? '−' : '+' }}</span>
            </div>
            <div class="answer" *ngIf="item.open">
              <p>{{ item.a }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .faq-container { max-width: 900px; margin: 60px auto; padding: 0 20px; }
    .header { text-align: center; margin-bottom: 50px; h1 { font-size: 32px; font-weight: 900; margin-bottom: 10px; } p { color: var(--text-secondary); } }
    
    .faq-grid { display: flex; flex-direction: column; gap: 15px; }
    .faq-item {
      padding: 24px; border-radius: var(--radius-md); transition: all 0.3s;
      .question { display: flex; justify-content: space-between; align-items: center; font-size: 16px; color: var(--text-primary); }
      .icon { font-size: 20px; font-weight: 900; color: var(--accent-blue); }
      .answer { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--glass-border); p { font-size: 15px; line-height: 1.6; color: var(--text-secondary); } }
    }

    .animate-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } }
  `]
})
export class FAQComponent {
    faqs = [
        { q: 'Como faço para alugar um carro?', a: 'Basta escolher o veículo no marketplace, selecionar as datas no formulário de reserva e confirmar. É necessário ter um perfil validado e ser maior de 21 anos.', open: false },
        { q: 'Quais documentos são necessários?', a: 'Você precisará de uma CNH (Carteira Nacional de Habilitação) válida e um cartão de crédito no nome do titular para o caução.', open: false },
        { q: 'Posso cancelar minha reserva?', a: 'Sim, cancelamentos feitos até 24h antes da data de retirada são totalmente gratuitos.', open: false },
        { q: 'O seguro já está incluso?', a: 'Oferecemos proteção básica em todos os aluguéis, mas você pode optar pela Proteção Completa no momento da reserva.', open: false },
        { q: 'A Nexdrive aceita Pix?', a: 'Sim! Aceitamos Pix para o pagamento do valor total da reserva, porém o caução ainda exige cartão de crédito.', open: false }
    ];
}
