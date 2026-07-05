import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="legal-container glass animate-in">
      <h1>Política de Privacidade</h1>
      <p class="intro">Na Nexdrive, a sua privacidade é nossa prioridade. Este documento detalha como coletamos, usamos e protegemos seus dados.</p>
      
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
    .footer-note { margin-top: 40px; font-size: 12px; color: var(--text-light); border-top: 1px solid var(--glass-border); padding-top: 20px; }
    .animate-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } }
  `]
})
export class PrivacyComponent {
    sections = [
        { title: '1. Coleta de Dados', content: 'Coletamos informações básicas como nome, CNH, CPF e e-mail para validar sua identidade e processar reservas de veículos.' },
        { title: '2. Uso de Informações', content: 'Seus dados são utilizados exclusivamente para a prestação dos serviços de aluguel, prevenção de fraudes e comunicações sobre suas reservas.' },
        { title: '3. Compartilhamento', content: 'Não vendemos seus dados a terceiros. Informações podem ser compartilhadas com parceiros logísticos e órgãos reguladores conforme exigido por lei.' },
        { title: '4. Segurança', content: 'Utilizamos criptografia de ponta a ponta e protocolos JWT para garantir que suas sessões e dados sensíveis permaneçam privados.' },
        { title: '5. Seus Direitos', content: 'Você tem o direito de solicitar a exclusão de seus dados a qualquer momento através do nosso canal de suporte.' }
    ];
}
