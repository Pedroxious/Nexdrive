import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-quality-meter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quality-meter-card">
      <div class="header">
        <h3 class="title">Qualidade do Anúncio</h3>
        <div class="badge" [ngClass]="getQualityClass()">
          {{ getQualityLabel() }}
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-bar-bg">
          <div 
            class="progress-bar-fill" 
            [style.width.%]="score"
            [ngClass]="getQualityClass()"
          ></div>
        </div>
        <div class="score-text">{{ score }}% concluído</div>
      </div>

      <ul class="tips-list">
        @for (tip of tips; track tip) {
          <li class="tip-item">
            <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span class="tip-text">{{ tip }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [`
    .quality-meter-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: 'Outfit', sans-serif;
    }
    .badge.basic {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
    }
    .badge.good {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    .badge.excellent {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .progress-bar-bg {
      width: 100%;
      height: 0.65rem;
      background: var(--bg-main);
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.5s ease-out, background-color 0.3s;
    }
    .progress-bar-fill.basic {
      background: #f97316;
    }
    .progress-bar-fill.good {
      background: #3b82f6;
    }
    .progress-bar-fill.excellent {
      background: #10b981;
    }
    .score-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-align: right;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
    }
    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .tip-icon {
      width: 1.1rem;
      height: 1.1rem;
      color: var(--accent);
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .tip-text {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.4;
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class AdQualityMeterComponent implements OnChanges {
  @Input() carData: any = {};
  
  score = 0;
  tips: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['carData']) {
      this.calculateQuality();
    }
  }

  calculateQuality() {
    let currentScore = 0;
    const newTips: string[] = [];
    const data = this.carData || {};

    // Basic Info (20 pts)
    let basicCount = 0;
    if (data.brand) basicCount++;
    if (data.model) basicCount++;
    if (data.year) basicCount++;
    if (data.category) basicCount++;
    
    currentScore += (basicCount * 5);
    if (basicCount < 4) {
      newTips.push("Preencha marca, modelo, ano e categoria para +20 pts.");
    }

    // Specs (20 pts)
    let specCount = 0;
    if (data.transmission) specCount++;
    if (data.fuelType) specCount++;
    if (data.mileage !== undefined && data.mileage !== null) specCount++;
    if (data.color) specCount++;
    
    currentScore += (specCount * 5);
    if (specCount < 4) {
      newTips.push("Adicione quilometragem, câmbio, combustível e cor para +20 pts.");
    }

    // Photos (30 pts)
    const photoCount = data.images?.length || 0;
    if (photoCount >= 3) {
      currentScore += 30;
    } else if (photoCount > 0) {
      currentScore += 15;
      const remaining = 3 - photoCount;
      newTips.push("Adicione mais " + remaining + " foto" + (remaining > 1 ? "s" : "") + " para +15 pts.");
    } else {
      newTips.push("Adicione pelo menos 3 fotos para +30 pts.");
    }

    // Price & Location (15 pts)
    if (data.pricePerDay && data.city && data.state) {
      currentScore += 15;
    } else {
      newTips.push("Defina o preço da diária e a localização para +15 pts.");
    }

    // Description (15 pts)
    if (data.description && data.description.length > 20) {
      currentScore += 15;
    } else {
      newTips.push("Escreva uma descrição completa para +15 pts.");
    }

    this.score = currentScore;
    this.tips = newTips;
  }

  getQualityClass(): string {
    if (this.score < 50) return 'basic';
    if (this.score < 80) return 'good';
    return 'excellent';
  }

  getQualityLabel(): string {
    if (this.score < 50) return 'Básico';
    if (this.score < 80) return 'Bom';
    return 'Excelente / Premium';
  }
}
