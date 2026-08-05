import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="brand-selector">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Buscar marca..." 
          [ngModel]="searchQuery()" 
          (ngModelChange)="searchQuery.set($event)"
          class="search-input"
        >
      </div>

      <div class="brand-grid">
        @for (brand of filteredBrands(); track brand) {
          <div 
            class="brand-card" 
            [class.selected]="selectedBrand === brand"
            (click)="selectBrand(brand)"
            (keydown.enter)="selectBrand(brand)"
            tabindex="0"
          >
            <div class="logo-container">
              <img [src]="'/assets/logos/' + brand.toLowerCase() + '.png'" [alt]="brand" class="brand-logo" onerror="this.style.display='none'">
            </div>
            <span class="brand-name">{{ brand }}</span>
          </div>
        }
        
        <div 
          class="brand-card custom-brand" 
          [class.selected]="selectedBrand === 'Outra marca'"
          (click)="selectBrand('Outra marca')"
          (keydown.enter)="selectBrand('Outra marca')"
          tabindex="0"
        >
          <div class="logo-container">
            <div class="plus-icon">+</div>
          </div>
          <span class="brand-name">Outra marca</span>
        </div>
      </div>

      @if (selectedBrand === 'Outra marca') {
        <div class="custom-brand-input-container">
          <input 
            type="text" 
            placeholder="Digite o nome da marca..." 
            [(ngModel)]="customBrandValue"
            (ngModelChange)="onCustomBrandChange($event)"
            class="custom-brand-input"
          >
        </div>
      }
    </div>
  `,
  styles: [`
    .brand-selector {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--text-secondary, #9ca3af);
    }
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border, #374151);
      background: var(--bg-main, #1f2937);
      color: var(--text-primary, #f9fafb);
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--accent, #06b6d4);
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
    }
    .brand-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
    }
    .brand-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border, #374151);
      background: var(--surface, #111827);
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .brand-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent, #06b6d4);
    }
    .brand-card.selected {
      border-color: var(--accent, #06b6d4);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
      background: rgba(6, 182, 212, 0.05);
    }
    .logo-container {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .plus-icon {
      font-size: 2rem;
      color: var(--text-secondary, #9ca3af);
    }
    .brand-card.selected .plus-icon {
      color: var(--accent, #06b6d4);
    }
    .brand-name {
      font-size: 0.875rem;
      color: var(--text-primary, #f9fafb);
      text-align: center;
      font-weight: 500;
    }
    .custom-brand-input-container {
      animation: slideDown 0.3s ease-out;
    }
    .custom-brand-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--accent, #06b6d4);
      background: var(--bg-main, #1f2937);
      color: var(--text-primary, #f9fafb);
      font-size: 1rem;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
    }
    .custom-brand-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BrandSelectorComponent {
  @Input() selectedBrand = '';
  @Output() brandChange = new EventEmitter<string>();
  @Output() customBrandChange = new EventEmitter<string>();

  searchQuery = signal('');
  customBrandValue = '';

  allBrands = [
    'Audi', 'BMW', 'BYD', 'Chery', 'Chevrolet', 'Citroen', 'Ferrari', 'Fiat', 'Ford', 
    'Honda', 'Hyundai', 'Jeep', 'Lamborghini', 'Land-Rover', 'McLaren', 'Mercedes-Benz', 
    'Mitsubishi', 'Nissan', 'Peugeot', 'Porsche', 'Renault', 'Tesla', 'Toyota', 
    'Volkswagen', 'Volvo'
  ];

  filteredBrands = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.allBrands;
    return this.allBrands.filter(b => b.toLowerCase().includes(query));
  });

  selectBrand(brand: string) {
    this.selectedBrand = brand;
    this.brandChange.emit(brand);
    if (brand !== 'Outra marca') {
      this.customBrandValue = '';
      this.customBrandChange.emit('');
    }
  }

  onCustomBrandChange(value: string) {
    this.customBrandChange.emit(value);
  }
}
