import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-container">
      <h2 class="step-title">Revisão do Anúncio</h2>
      
      <div class="preview-card">
        <div class="hero-gallery" *ngIf="carData.images?.length">
          <img [src]="carData.images[0]" alt="Foto principal do veículo" class="hero-image" />
          <div class="badge-count" *ngIf="carData.images.length > 1">
            +{{ carData.images.length - 1 }} fotos
          </div>
        </div>
        <div class="hero-placeholder" *ngIf="!carData.images?.length">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Nenhuma foto adicionada</span>
        </div>

        <div class="preview-content">
          <div class="header-row">
            <div>
              <h3 class="car-title">{{ getBrandName() }} {{ carData.model || 'Modelo não informado' }}</h3>
              <p class="car-subtitle">{{ carData.year }} • {{ carData.category }}</p>
            </div>
            <div class="price-tag">
              {{ formatPrice(carData.pricePerDay) }}<span class="per-day">/dia</span>
            </div>
          </div>

          <div class="spec-badges">
            <span class="badge" *ngIf="carData.fuelType">Combustível: {{ carData.fuelType }}</span>
            <span class="badge" *ngIf="carData.transmission">Câmbio: {{ carData.transmission }}</span>
            <span class="badge" *ngIf="carData.mileage">{{ formatKm(carData.mileage) }}</span>
            <span class="badge" *ngIf="carData.city">{{ carData.city }} - {{ carData.state }}</span>
            <span class="badge" *ngIf="carData.color">Cor: {{ carData.color }}</span>
          </div>

          <div class="description-preview">
            <h4>Descrição do Anúncio</h4>
            <p>{{ carData.description || 'Nenhuma descrição fornecida.' }}</p>
          </div>
        </div>
      </div>

      <div class="terms-section">
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="agreed" />
          <span>Declaro que as informações acima são verdadeiras e aceito os Termos de Uso e Política de Publicação da Nexdrive.</span>
        </label>
      </div>

      <button class="submit-btn" [class.loading]="isSubmitting" [disabled]="!agreed || isSubmitting" (click)="onSubmit()">
        <span *ngIf="!isSubmitting">🚀 Publicar Anúncio Agora</span>
        <span *ngIf="isSubmitting" class="spinner"></span>
        <span *ngIf="isSubmitting">Publicando anúncio...</span>
      </button>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease-out; }
    .step-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; }
    .preview-card { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--surface); box-shadow: var(--shadow-md); }
    .hero-gallery { position: relative; height: 260px; width: 100%; background: #000; }
    .hero-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }
    .hero-placeholder { height: 200px; display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center; background: var(--bg-main); color: var(--text-muted); font-weight: 500; font-family: 'Inter', sans-serif; }
    .badge-count { position: absolute; bottom: 1rem; right: 1rem; background: rgba(0,0,0,0.7); color: white; padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.75rem; font-weight: 600; backdrop-filter: blur(4px); }
    .preview-content { padding: 1.5rem; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .car-title { font-size: 1.35rem; font-weight: 800; margin: 0; color: var(--text-primary); font-family: 'Outfit', sans-serif; }
    .car-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0.25rem 0 0 0; font-family: 'Inter', sans-serif; }
    .price-tag { font-size: 1.5rem; font-weight: 800; color: var(--accent); font-family: 'Outfit', sans-serif; }
    .per-day { font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); }
    .spec-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .badge { padding: 0.35rem 0.85rem; background: rgba(0, 191, 234, 0.1); color: var(--accent); border-radius: 20px; font-size: 0.8rem; font-weight: 600; font-family: 'Inter', sans-serif; }
    .description-preview h4 { font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem 0; color: var(--text-primary); font-family: 'Outfit', sans-serif; }
    .description-preview p { font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin: 0; white-space: pre-wrap; font-family: 'Inter', sans-serif; }
    .terms-section { margin-top: 0.5rem; padding: 16px; background: var(--bg-main); border: 1px solid var(--border); border-radius: 12px; }
    .checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-size: 0.875rem; color: var(--text-primary); font-family: 'Inter', sans-serif; }
    .checkbox-label input { width: 1.125rem; height: 1.125rem; cursor: pointer; }
    .submit-btn { position: relative; width: 100%; padding: 1rem; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 1.05rem; font-weight: 700; font-family: 'Outfit', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0, 191, 234, 0.3); }
    .submit-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 191, 234, 0.4); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepReviewComponent {
  @Input() carData: any = {};
  @Input() isSubmitting = false;
  @Output() submitAd = new EventEmitter<void>();

  agreed = false;

  getBrandName(): string {
    if (!this.carData) return 'Marca';
    return this.carData.brand === 'OUTRA' ? (this.carData.customBrand || 'Outra Marca') : (this.carData.brand || 'Marca');
  }

  formatPrice(value: number): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatKm(value: number): string {
    if (!value) return '0 km';
    return value.toLocaleString('pt-BR') + ' km';
  }

  onSubmit() {
    if (this.agreed && !this.isSubmitting) {
      this.submitAd.emit();
    }
  }
}
