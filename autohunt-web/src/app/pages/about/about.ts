import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="about-container animate-in">
      <section class="hero-section">
        <h1>Nex<span class="logo-accent">drive</span></h1>
        <p>A nova era da mobilidade e aluguel de veículos premium no Brasil.</p>
      </section>

      <div class="content-grid">
        <div class="card">
          <h3>Nossa Missão</h3>
          <p>Democratizar o acesso a veículos premium através de tecnologia intuitiva e atendimento de excelência, conectando pessoas com as melhores experiências de direção.</p>
        </div>

        <div class="card">
          <h3>Nossa Visão</h3>
          <p>Ser o ecossistema de aluguel e assinatura de veículos mais admirado e inovador da América Latina, sinônimo de conveniência, estilo e sustentabilidade.</p>
        </div>

        <div class="card">
          <h3>Nossos Valores</h3>
          <ul class="values-list">
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Transparência total</span>
            </li>
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Segurança em primeiro lugar</span>
            </li>
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Inovação contínua</span>
            </li>
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Obsessão pelo cliente</span>
            </li>
          </ul>
        </div>
      </div>

      <section class="history">
        <h2>Nossa História</h2>
        <p>Nascida em 2024 no coração de São Paulo, a Nexdrive surgiu com a missão de redefinir o aluguel de veículos. Combinamos a paixão por tecnologia com a expertise do mercado automobilístico para criar uma plataforma robusta, simplificada e livre de burocracias.</p>
        <p>Hoje, atendemos em mais de 12 estados com uma frota diversificada que abrange desde hatchbacks urbanos práticos e econômicos até SUVs robustos e elétricos premium de última geração.</p>
      </section>
    </div>
  `,
    styles: [`
    .about-container {
      max-width: var(--max-width);
      margin: 40px auto;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    
    .hero-section {
      padding: 80px 40px;
      text-align: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      
      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 60px;
        font-weight: 800;
        letter-spacing: -1px;
        color: var(--text-primary);
        margin-bottom: 12px;
      }
      .logo-accent {
        color: var(--accent);
      }
      p {
        font-family: 'Inter', sans-serif;
        font-size: 18px;
        font-weight: 500;
        color: var(--text-secondary);
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .card {
      padding: 32px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      
      h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: var(--text-secondary);
      }
    }

    .values-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
        
        .check-icon {
          width: 14px;
          height: 14px;
          color: var(--accent);
          flex-shrink: 0;
        }
      }
    }

    .history {
      padding: 48px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      
      h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        font-size: 15px;
        line-height: 1.7;
        color: var(--text-secondary);
        margin-bottom: 16px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .animate-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 992px) {
      .content-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `]
})
export class AboutComponent { }
