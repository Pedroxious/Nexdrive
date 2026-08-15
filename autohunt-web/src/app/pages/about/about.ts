import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="about-container animate-in">
      <section class="hero-section">
        <h1>Nex<span class="logo-accent">drive</span></h1>
        <p>{{ langService.t('about.subtitle') }}</p>
      </section>

      <div class="content-grid">
        <div class="card">
          <h3>{{ langService.currentLang() === 'pt' ? 'Nossa Missão' : 'Our Mission' }}</h3>
          <p>{{ langService.currentLang() === 'pt' ? 'Democratizar o acesso a veículos premium através de tecnologia intuitiva e atendimento de excelência, conectando pessoas com as melhores experiências de direção.' : 'Democratize access to premium vehicles through intuitive technology and service excellence, connecting people with top driving experiences.' }}</p>
        </div>

        <div class="card">
          <h3>{{ langService.currentLang() === 'pt' ? 'Nossa Visão' : 'Our Vision' }}</h3>
          <p>{{ langService.currentLang() === 'pt' ? 'Ser o ecossistema de aluguel e assinatura de veículos mais admirado e inovador da América Latina, sinônimo de conveniência, estilo e sustentabilidade.' : 'To be Latin America\'s most admired and innovative vehicle rental and subscription ecosystem, synonymous with convenience, style, and sustainability.' }}</p>
        </div>

        <div class="card">
          <h3>{{ langService.currentLang() === 'pt' ? 'Nossos Valores' : 'Our Values' }}</h3>
          <ul class="values-list">
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ langService.currentLang() === 'pt' ? 'Transparência total' : 'Total transparency' }}</span>
            </li>
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ langService.currentLang() === 'pt' ? 'Segurança em primeiro lugar' : 'Safety first' }}</span>
            </li>
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ langService.currentLang() === 'pt' ? 'Inovação contínua' : 'Continuous innovation' }}</span>
            </li>
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ langService.currentLang() === 'pt' ? 'Obsessão pelo cliente' : 'Customer obsession' }}</span>
            </li>
          </ul>
        </div>
      </div>

      <section class="history">
        <h2>{{ langService.currentLang() === 'pt' ? 'Nossa História' : 'Our Story' }}</h2>
        <p>{{ langService.currentLang() === 'pt' ? 'Nascida em 2024 no coração de São Paulo, a Nexdrive surgiu com a missão de redefinir o aluguel de veículos. Combinamos a paixão por tecnologia com a expertise do mercado automobilístico para criar uma plataforma robusta, simplificada e livre de burocracias.' : 'Founded in 2024 in São Paulo, Nexdrive was created with the mission to redefine car rental. We combine passion for technology with automotive industry expertise to build a robust, streamlined, and hassle-free platform.' }}</p>
        <p>{{ langService.currentLang() === 'pt' ? 'Hoje, atendemos em mais de 12 estados com uma frota diversificada que abrange desde hatchbacks urbanos práticos e econômicos até SUVs robustos e elétricos premium de última geração.' : 'Today, we operate across more than 12 states with a diverse fleet ranging from practical urban hatchbacks to robust SUVs and cutting-edge electric vehicles.' }}</p>
      </section>

      <section class="stats">
        <div class="stat">
          <span class="number">1.200+</span>
          <span class="label">{{ langService.t('about.fleet_stat') }}</span>
        </div>
        <div class="stat">
          <span class="number">24</span>
          <span class="label">{{ langService.t('about.cities_stat') }}</span>
        </div>
        <div class="stat">
          <span class="number">15.000+</span>
          <span class="label">{{ langService.t('about.users_stat') }}</span>
        </div>
      </section>
    </div>
  `,
    styles: [`
    .about-container { max-width: 1000px; margin: 0 auto; padding: 60px 20px; }
    
    .hero-section {
      text-align: center; margin-bottom: 60px;
      h1 { font-size: 48px; font-weight: 900; margin-bottom: 16px; }
      p { font-size: 20px; color: var(--text-secondary); max-width: 600px; margin: 0 auto; }
    }

    .content-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 60px;
      .card {
        background: var(--surface); padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--border);
        h3 { font-size: 20px; font-weight: 800; margin-bottom: 12px; color: var(--accent); }
        p { color: var(--text-secondary); line-height: 1.6; font-size: 15px; }
      }
    }

    .values-list {
      list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;
      li {
        display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; color: var(--text-primary);
        .check-icon { width: 18px; height: 18px; color: var(--success); flex-shrink: 0; }
      }
    }

    .history {
      background: var(--surface); padding: 40px; border-radius: var(--radius-lg); border: 1px solid var(--border); margin-bottom: 60px;
      h2 { font-size: 24px; font-weight: 800; margin-bottom: 16px; color: var(--accent); }
      p { color: var(--text-secondary); line-height: 1.6; font-size: 16px; margin-bottom: 16px; &:last-child { margin-bottom: 0; } }
    }

    .stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; text-align: center;
      .stat {
        background: var(--surface-secondary); padding: 32px; border-radius: var(--radius-lg);
        .number { display: block; font-size: 36px; font-weight: 900; color: var(--accent); margin-bottom: 8px; }
        .label { font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
      }
    }

    @media (max-width: 640px) {
      .hero-section h1 { font-size: 36px; }
      .stats { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent {
  langService = inject(LanguageService);
}
