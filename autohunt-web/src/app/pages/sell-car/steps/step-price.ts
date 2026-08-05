import { Component, EventEmitter, Input, Output, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-step-price',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-container">
      <h2 class="step-title">Preço e Descrição</h2>
      
      <div class="form-row">
        <div class="form-group flex-1">
          <label>Preço Diária (R$/dia)</label>
          <input 
            type="number" 
            [(ngModel)]="carData.pricePerDay" 
            (ngModelChange)="updateData()" 
            class="form-control price-input" 
            placeholder="180" 
          />
          <div class="price-indicator" *ngIf="carData.pricePerDay">
            <div class="indicator-bar" [ngClass]="getIndicatorClass()"></div>
            <span class="indicator-text">{{ getIndicatorText() }}</span>
          </div>
        </div>

        <div class="form-group flex-1">
          <label>Preço para Venda (Opcional R$)</label>
          <input 
            type="number" 
            [(ngModel)]="carData.salePrice" 
            (ngModelChange)="updateData()" 
            class="form-control" 
            placeholder="Ex: 85000" 
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label>Cidade</label>
          <input type="text" [(ngModel)]="carData.city" (ngModelChange)="updateData()" class="form-control" placeholder="Ex: São Paulo" />
        </div>
        <div class="form-group" style="width: 100px;">
          <label>Estado</label>
          <input type="text" [(ngModel)]="carData.state" (ngModelChange)="updateData()" class="form-control" placeholder="SP" maxlength="2" />
        </div>
      </div>

      <div class="form-group">
        <div class="header-row">
          <label>Descrição do Veículo</label>
          <button 
            type="button" 
            class="ai-btn" 
            [class.generating]="isGenerating"
            [class.typing]="isTyping"
            (click)="generateDescription()"
          >
            <!-- Default idle state -->
            <span *ngIf="!isGenerating && !isTyping" class="btn-content">
              {{ aiGenerated ? '🔄 Gerar outra versão' : '✨ Gerar descrição com IA' }}
            </span>

            <!-- Processing state -->
            <span *ngIf="isGenerating" class="btn-content processing">
              <span class="ai-sparkle-spin">⚡</span>
              Sintetizando com IA...
            </span>

            <!-- Typing / Streaming state -->
            <span *ngIf="isTyping" class="btn-content typing">
              <span class="typing-dots">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </span>
              Escrevendo anúncio...
            </span>
          </button>
        </div>

        <div class="textarea-wrapper" [class.is-streaming]="isTyping">
          <textarea 
            [(ngModel)]="carData.description" 
            (ngModelChange)="updateData()" 
            class="form-control description-textarea" 
            rows="6" 
            placeholder="Descreva os detalhes do veículo, estado de conservação, opcionais..."
          ></textarea>
          <div class="typing-cursor-badge" *ngIf="isTyping">
            <span class="live-dot"></span> IA Gerando
          </div>
        </div>

        <div class="char-count" [class.error]="(carData.description?.length || 0) < 50">
          {{ carData.description?.length || 0 }} caracteres (Mínimo: 50)
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease-out; position: relative; }
    .step-title { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    .header-row { display: flex; justify-content: space-between; align-items: center; }
    label { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
    .form-control { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); transition: border-color 0.2s; font-family: inherit; }
    .form-control:focus { outline: none; border-color: var(--accent); }
    .price-input { font-size: 1.25rem; font-weight: 600; }
    .price-indicator { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
    .indicator-bar { height: 6px; width: 60px; border-radius: 3px; background: #ccc; }
    .indicator-bar.low { background: #10b981; }
    .indicator-bar.comp { background: #3b82f6; }
    .indicator-bar.high { background: #ef4444; }
    .indicator-text { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary, #666); }

    /* AI Button & Micro-interactions */
    .ai-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.55rem 1.25rem;
      background: linear-gradient(135deg, #a855f7, #6366f1, #00bfea);
      background-size: 200% 200%;
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.25);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ai-btn:hover {
      transform: translateY(-1.5px);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
      background-position: 100% 50%;
    }
    .ai-btn:active {
      transform: scale(0.96);
    }
    .ai-btn.generating {
      animation: pulseGlow 1.4s ease-in-out infinite alternate;
      cursor: wait;
    }
    .ai-btn.typing {
      background: linear-gradient(135deg, #10b981, #00bfea);
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .ai-sparkle-spin {
      display: inline-block;
      animation: spinPulse 1s linear infinite;
    }

    /* Typing indicators */
    .typing-dots {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .typing-dots .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: white;
      animation: dotPulse 1.2s infinite ease-in-out;
    }
    .typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }

    /* Textarea streaming FX */
    .textarea-wrapper {
      position: relative;
    }
    .textarea-wrapper.is-streaming .description-textarea {
      border-color: #00bfea;
      box-shadow: 0 0 0 3px rgba(0, 191, 234, 0.15);
    }
    .typing-cursor-badge {
      position: absolute;
      top: 10px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(0, 191, 234, 0.12);
      border: 1px solid rgba(0, 191, 234, 0.3);
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 600;
      color: #00bfea;
      pointer-events: none;
      backdrop-filter: blur(4px);
    }
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00bfea;
      box-shadow: 0 0 8px #00bfea;
      animation: pulseGlow 0.8s ease-in-out infinite alternate;
    }

    .char-count { font-size: 0.75rem; color: var(--text-secondary, #666); text-align: right; }
    .char-count.error { color: #ef4444; }

    @keyframes spinPulse {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes pulseGlow {
      from { opacity: 0.7; box-shadow: 0 0 8px rgba(0,191,234,0.3); }
      to { opacity: 1; box-shadow: 0 0 18px rgba(0,191,234,0.8); }
    }
    @keyframes dotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepPriceComponent implements OnDestroy {
  @Input() carData: any = {};
  @Output() carDataChange = new EventEmitter<any>();
  
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  isGenerating = false;
  isTyping = false;
  aiGenerated = false;

  // Session-based anti-repetition memory
  private generatedHistory: string[] = [];
  private activeSub: Subscription | null = null;
  private animFrameId: number | null = null;

  ngOnDestroy() {
    this.cancelActiveGeneration();
  }

  getIndicatorClass() {
    const p = this.carData.pricePerDay || 0;
    if (p <= 180) return 'low';
    if (p <= 350) return 'comp';
    return 'high';
  }

  getIndicatorText() {
    const p = this.carData.pricePerDay || 0;
    if (p <= 180) return 'Preço muito acessível (Alta demanda)';
    if (p <= 350) return 'Preço competitivo (Na média de mercado)';
    return 'Preço categoria premium';
  }

  generateDescription() {
    // If generation or typing is currently in progress, cancel immediately to restart fresh
    this.cancelActiveGeneration();

    this.isGenerating = true;

    // Payload includes vehicle metadata and current session description history
    const payload = {
      ...this.carData,
      previousDescriptions: this.generatedHistory
    };

    this.activeSub = this.http.post<any>('/api/vehicles/generate-description', payload).subscribe({
      next: (res) => {
        this.isGenerating = false;
        const text = (res && res.description) ? res.description : this.fallbackGenerateText();
        this.streamTextToDescription(text);
      },
      error: () => {
        this.isGenerating = false;
        const text = this.fallbackGenerateText();
        this.streamTextToDescription(text);
      }
    });
  }

  private streamTextToDescription(fullText: string) {
    this.isTyping = true;
    this.aiGenerated = true;
    this.carData.description = '';
    this.updateData();

    // Add to session history
    if (!this.generatedHistory.includes(fullText)) {
      this.generatedHistory.push(fullText);
    }

    let charIndex = 0;
    const totalChars = fullText.length;
    // Total typing time target: ~1.4 seconds (~80 FPS steps)
    const chunkSize = Math.max(3, Math.ceil(totalChars / 50));

    const step = () => {
      if (!this.isTyping) return;

      charIndex = Math.min(totalChars, charIndex + chunkSize);
      this.carData.description = fullText.substring(0, charIndex);
      this.updateData();

      if (charIndex < totalChars) {
        this.animFrameId = requestAnimationFrame(step);
      } else {
        this.isTyping = false;
        this.toast.success('✨ Nova versão gerada com sucesso!');
      }
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  private cancelActiveGeneration() {
    if (this.activeSub) {
      this.activeSub.unsubscribe();
      this.activeSub = null;
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.isGenerating = false;
    this.isTyping = false;
  }

  private fallbackGenerateText(): string {
    const brand = this.carData.brand === 'OUTRA' ? (this.carData.customBrand || 'Veículo') : (this.carData.brand || 'Veículo');
    const model = this.carData.model || '';
    const year = this.carData.year || new Date().getFullYear();
    const fuel = (this.carData.fuelType || 'FLEX').toLowerCase();
    const trans = (this.carData.transmission || 'AUTOMATIC').toLowerCase() === 'automatic' ? 'automático' : 'manual';
    const city = this.carData.city || 'São Paulo';

    return `Espetacular ${brand} ${model} ${year} em impecável estado de conservação, localizado em ${city}. Veículo completo equipado com câmbio ${trans} e motorização ${fuel}. Excelente opção tanto para viagens confortáveis quanto para a rotina diária. Veículo higienizado, revisado e pronto para entrega imediata!`;
  }

  updateData() {
    this.carDataChange.emit(this.carData);
  }
}
