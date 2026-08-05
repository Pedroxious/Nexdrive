import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-preview-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="live-preview-wrapper">
      <div class="preview-header">
        <h3 class="preview-title">Pré-visualização</h3>
        <span class="preview-subtitle">Como os clientes verão seu anúncio</span>
      </div>

      <div class="preview-card">
        <div class="image-container">
          @if (carData?.images?.length > 0) {
            <img [src]="carData.images[0]" alt="Carro" class="main-image">
            <div class="photo-count">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              {{ carData.images.length }}
            </div>
          } @else {
            <div class="image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Sem fotos</span>
            </div>
          }
          
          @if (carData?.category) {
            <div class="category-badge">{{ carData.category }}</div>
          }
        </div>

        <div class="card-content">
          <div class="title-row">
            <h4 class="car-title">
              {{ carData?.brand || 'Marca' }} {{ carData?.model || 'Modelo' }}
            </h4>
            <span class="year-tag">{{ carData?.year || 'Ano' }}</span>
          </div>

          <div class="price-row">
            <span class="price-value">R$ {{ (carData?.price || 0).toLocaleString('pt-BR') }}</span>
            <span class="price-period">/dia</span>
          </div>

          <div class="specs-row">
            <div class="spec-pill">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {{ (carData?.mileage | number) || '0' }} km
            </div>
            <div class="spec-pill">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>
              {{ carData?.transmission || 'Câmbio' }}
            </div>
            <div class="spec-pill">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              {{ carData?.fuelType || 'Combustível' }}
            </div>
          </div>

          <div class="location-row">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {{ carData?.city || 'Cidade' }}, {{ carData?.state || 'UF' }}
          </div>
        </div>
      </div>

      <div class="save-indicator">
        @if (isSaving) {
          <div class="spinner"></div>
          <span>Salvando rascunho...</span>
        } @else if (lastSaved) {
          <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Rascunho salvo às {{ lastSaved | date:'HH:mm:ss' }}</span>
        } @else {
          <span>Não salvo</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .live-preview-wrapper {
      position: sticky;
      top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .preview-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .preview-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #f9fafb);
      margin: 0;
    }
    .preview-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary, #9ca3af);
    }
    .preview-card {
      background: var(--surface, #111827);
      border: 1px solid var(--border, #374151);
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
    }
    .preview-card:hover {
      transform: translateY(-4px);
    }
    .image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background: var(--bg-main, #1f2937);
    }
    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--text-secondary, #9ca3af);
    }
    .image-placeholder svg {
      width: 3rem;
      height: 3rem;
    }
    .photo-count {
      position: absolute;
      bottom: 0.75rem;
      right: 0.75rem;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      backdrop-filter: blur(4px);
    }
    .photo-count svg {
      width: 1rem;
      height: 1rem;
    }
    .category-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: var(--accent, #06b6d4);
      color: #fff;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .card-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .car-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary, #f9fafb);
      margin: 0;
      line-height: 1.4;
    }
    .year-tag {
      background: var(--bg-main, #1f2937);
      color: var(--text-secondary, #9ca3af);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }
    .price-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent, #06b6d4);
    }
    .price-period {
      font-size: 0.875rem;
      color: var(--text-secondary, #9ca3af);
    }
    .specs-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .spec-pill {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: var(--bg-main, #1f2937);
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: var(--text-secondary, #9ca3af);
      font-weight: 500;
    }
    .spec-pill svg {
      width: 1rem;
      height: 1rem;
    }
    .location-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #9ca3af);
      padding-top: 0.75rem;
      border-top: 1px solid var(--border, #374151);
    }
    .location-row svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    .save-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #9ca3af);
      padding: 0.5rem;
    }
    .check-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--accent, #06b6d4);
    }
    .spinner {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--border, #374151);
      border-top-color: var(--accent, #06b6d4);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LivePreviewPanelComponent {
  @Input() carData: any = {};
  @Input() lastSaved: Date | null = null;
  @Input() isSaving = false;
}
