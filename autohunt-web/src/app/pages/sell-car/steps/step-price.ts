import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
          <button type="button" class="ai-btn" (click)="generateDescription()" [disabled]="isGenerating">
            <span *ngIf="!isGenerating">{{ aiGenerated ? '🔄 Gerar outra versão' : '✨ Gerar descrição com IA' }}</span>
            <span *ngIf="isGenerating" class="spinner"></span>
            <span *ngIf="isGenerating">Gerando...</span>
          </button>
        </div>
        <textarea [(ngModel)]="carData.description" (ngModelChange)="updateData()" class="form-control" rows="6" placeholder="Descreva os detalhes do veículo, estado de conservação, opcionais..."></textarea>
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
    .ai-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #a855f7, #6366f1); color: white; border: none; border-radius: 20px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    .ai-btn:hover:not(:disabled) { opacity: 0.9; }
    .ai-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    .char-count { font-size: 0.75rem; color: var(--text-secondary, #666); text-align: right; }
    .char-count.error { color: #ef4444; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepPriceComponent {
  @Input() carData: any = {};
  @Output() carDataChange = new EventEmitter<any>();
  
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  isGenerating = false;
  aiGenerated = false;

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
    this.isGenerating = true;
    
    this.http.post<any>('/api/vehicles/generate-description', this.carData).subscribe({
      next: (res) => {
        if (res && res.description) {
          this.carData.description = res.description;
        } else {
          this.fallbackGenerate();
        }
        this.aiGenerated = true;
        this.isGenerating = false;
        this.updateData();
        this.toast.success('✨ Descrição gerada com inteligência de composição!');
      },
      error: () => {
        this.fallbackGenerate();
        this.aiGenerated = true;
        this.isGenerating = false;
        this.updateData();
        this.toast.success('✨ Descrição gerada com inteligência de composição!');
      }
    });
  }

  private fallbackGenerate() {
    const brand = this.carData.brand === 'OUTRA' ? (this.carData.customBrand || 'Veículo') : (this.carData.brand || 'Veículo');
    const model = this.carData.model || '';
    const year = this.carData.year || new Date().getFullYear();
    const fuel = (this.carData.fuelType || 'FLEX').toLowerCase();
    const trans = (this.carData.transmission || 'AUTOMATIC').toLowerCase() === 'automatic' ? 'automático' : 'manual';
    const city = this.carData.city || 'São Paulo';

    this.carData.description = `Excelente ${brand} ${model} ${year} em excelente estado de conservação, localizado em ${city}. Veículo completo equipado com câmbio ${trans} e motorização ${fuel}. Excelente opção tanto para viagens confortáveis quanto para a rotina diária. Veículo higienizado, revisado e pronto para entrega!`;
  }

  updateData() {
    this.carDataChange.emit(this.carData);
  }
}
