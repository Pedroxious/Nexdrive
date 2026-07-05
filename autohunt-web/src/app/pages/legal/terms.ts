import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-terms',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="legal-container glass animate-in">
      <h1>Termos de Uso</h1>
      <p class="intro">Ao utilizar a plataforma Nexdrive, você concorda com os seguintes termos e condições de serviço.</p>
      
      @for (section of sections; track section.title) {
        <section class="section">
          <h2>{{ section.title }}</h2>
          <p>{{ section.content }}</p>
        </section>
      }
      
      <p class="footer-note">Última atualização: 25 de Maio de 2026.</p>
    </div>
  `,
    styles: [`
    .legal-container { max-width: 800px; margin: 60px auto; padding: 60px; border-radius: var(--radius-lg); }
    h1 { font-size: 32px; font-weight: 900; margin-bottom: 20px; color: var(--accent-blue); }
    .intro { font-size: 16px; color: var(--text-secondary); margin-bottom: 40px; line-height: 1.6; }
    .section { margin-bottom: 30px; h2 { font-size: 18px; font-weight: 800; margin-bottom: 15px; } p { font-size: 14px; line-height: 1.8; color: var(--text-secondary); } }
    .animate-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } }
  `]
})
export class TermsComponent {
    sections = [
        { title: '1. Elegibilidade', content: 'O usuário deve ter no mínimo 21 anos e possuir CNH definitiva válida na categoria B por pelo menos 2 anos.' },
        { title: '2. Responsabilidade do Veículo', content: 'O locatário é responsável pela guarda e bom uso do veículo durante todo o período da reserva, respondendo por multas e avarias.' },
        { title: '3. Pagamentos e Caução', content: 'A Nexdrive exige um bloqueio de valor (caução) no cartão de crédito do titular no momento da retirada como garantia.' },
        { title: '4. Cancelamento', content: 'Reservas podem ser canceladas sem ônus até 24h antes do início. Cancelamentos tardios podem incorrer em taxa de no-show.' },
        { title: '5. Alterações nos Termos', content: 'Reservamo-nos o direito de alterar estes termos. O uso contínuo da plataforma implica aceitação das novas condições.' }
    ];
}
