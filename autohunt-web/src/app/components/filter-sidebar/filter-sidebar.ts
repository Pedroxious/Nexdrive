import { Component, Input, Output, EventEmitter, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
   selector: 'app-filter-sidebar',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Filtros</h2>
        <button class="reset-all" (click)="clearAll()">Limpar tudo</button>
      </div>

      <!-- Car Type Section -->
      <div class="filter-section" [class.collapsed]="isCollapsed('type')">
        <button class="section-trigger" (click)="toggleSection('type')">
          <span>Tipo de Veículo</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="section-content">
          <div class="toggle-group">
            <button [class.active]="carType() === 'all'" (click)="setCarType('all')">Todos</button>
            <button [class.active]="carType() === 'new'" (click)="setCarType('new')">Novos</button>
            <button [class.active]="carType() === 'used'" (click)="setCarType('used')">Seminovos</button>
          </div>
        </div>
      </div>

      <!-- Brands Section -->
      <div class="filter-section" [class.collapsed]="isCollapsed('brands')">
        <button class="section-trigger" (click)="toggleSection('brands')">
          <span>Marcas</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="section-content">
          <div class="brand-grid">
            @for (brand of brands; track brand) {
              <button 
                class="brand-chip" 
                [class.active]="selectedBrands().includes(brand)"
                (click)="toggleBrand(brand)"
                [title]="brand"
              >
                <img 
                  [src]="brandLogoFile(brand)" 
                  [alt]="brand"
                  class="brand-logo"
                  (error)="onLogoError($event, brand)"
                  draggable="false"
                />
                <span class="brand-fallback-text" style="display:none">{{ brand }}</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Price Section -->
      <div class="filter-section" [class.collapsed]="isCollapsed('price')">
        <button class="section-trigger" (click)="toggleSection('price')">
          <span>Preço Diária</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="section-content">
          <div class="price-info">
            <span class="price-val">Até R$ {{ maxPrice() }}</span>
          </div>
          <input 
            type="range" 
            [min]="0" 
            [max]="1000" 
            [step]="50"
            [(ngModel)]="rangeValue" 
            (input)="onPriceChange()"
            class="price-slider"
          >
          <div class="price-labels">
            <span>R$ 0</span>
            <span>R$ 1.000+</span>
          </div>
        </div>
      </div>

      <!-- Fuel Section -->
      <div class="filter-section" [class.collapsed]="isCollapsed('fuel')">
        <button class="section-trigger" (click)="toggleSection('fuel')">
          <span>Combustível</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="section-content">
          <div class="checkbox-list">
            @for (fuel of fuels; track fuel) {
              <label class="checkbox-item clickable">
                <input type="checkbox" [checked]="selectedFuels().includes(fuel)" (change)="toggleFuel(fuel)">
                <span class="checkmark"></span>
                <span class="label-text">{{ fuel }}</span>
              </label>
            }
          </div>
        </div>
      </div>

      <!-- Transmission Section -->
      <div class="filter-section" [class.collapsed]="isCollapsed('transmission')">
        <button class="section-trigger" (click)="toggleSection('transmission')">
          <span>Transmissão</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="section-content">
          <div class="checkbox-list">
            @for (trans of transmissions; track trans) {
              <label class="checkbox-item clickable">
                <input type="checkbox" [checked]="selectedTrans().includes(trans)" (change)="toggleTrans(trans)">
                <span class="checkmark"></span>
                <span class="label-text">{{ trans }}</span>
              </label>
            }
          </div>
        </div>
      </div>

      <!-- Options Section -->
      <div class="filter-section" [class.collapsed]="isCollapsed('options')">
        <button class="section-trigger" (click)="toggleSection('options')">
          <span>Diferenciais</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="section-content">
          <label class="switch-item clickable">
            <span class="label-text">Free Test Drive</span>
            <input type="checkbox" [checked]="testDrive()" (change)="toggleTestDrive()">
            <span class="switch"></span>
          </label>
        </div>
      </div>
    </div>
  `,
   styles: [`
    :host {
      display: block;
    }

    .sidebar {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: sticky;
      top: 100px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }

    .reset-all {
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 600;
      color: #00BFFF;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      transition: color 0.2s;
      &:hover {
        color: #00AADD;
      }
    }

    .filter-section {
      border-bottom: none;
      padding-top: 16px;
      padding-bottom: 16px;
      margin-bottom: 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      &:first-of-type {
        border-top: none;
      }
      &:last-child {
        padding-bottom: 0;
        margin-bottom: 0;
      }
    }

    .section-trigger {
      width: 100%;
      background: none;
      border: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      text-align: left;

      .chevron {
        width: 16px;
        height: 16px;
        color: var(--text-secondary);
        transition: transform 0.2s ease;
      }
    }

    .section-content {
      padding-top: 12px;
      max-height: 500px;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease, opacity 0.3s ease;
      opacity: 1;
    }

    /* Collapsed state styles */
    .filter-section.collapsed {
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 8px;
      .section-trigger .chevron {
        transform: rotate(-90deg);
      }
      .section-content {
        max-height: 0;
        padding-top: 0;
        opacity: 0;
        pointer-events: none;
      }
    }

    .toggle-group {
      display: flex;
      background: var(--surface-secondary);
      border: 1px solid var(--border-light);
      padding: 4px;
      border-radius: var(--radius-md);
      gap: 4px;

      button {
        flex: 1;
        background: transparent;
        border: none;
        padding: 8px 12px;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(.active) {
          color: var(--text-primary);
        }

        &.active {
          background: var(--surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          font-weight: 700;
        }
      }
    }

    .brand-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .brand-chip {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 8px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(.active) {
        border-color: var(--text-secondary);
        color: var(--text-primary);
      }

      &.active {
        background: var(--accent-light);
        border-color: var(--accent);
        color: var(--accent);
        font-weight: 700;
        .brand-logo {
          filter: brightness(0) saturate(100%) invert(55%) sepia(98%) saturate(1000%) hue-rotate(160deg) brightness(1.1);
        }
      }
    }

    .brand-logo {
      max-height: 28px;
      max-width: 100%;
      object-fit: contain;
      transition: filter 0.2s ease;
      pointer-events: none;
    }

    :host-context([data-theme='dark']) .brand-logo {
      filter: brightness(0) invert(1);
    }

    :host-context([data-theme='dark']) .brand-chip.active .brand-logo {
      filter: brightness(0) saturate(100%) invert(55%) sepia(98%) saturate(1000%) hue-rotate(160deg) brightness(1.1);
    }

    .brand-fallback-text {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      pointer-events: none;
    }

    .price-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      .price-val {
        font-family: 'Outfit', sans-serif;
        font-size: 15px;
        font-weight: 700;
        color: var(--accent);
      }
    }

    .price-slider {
      width: 100%;
      height: 6px;
      background: var(--border);
      border-radius: var(--radius-full);
      appearance: none;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        background: var(--accent);
        border-radius: 50%;
        border: 2px solid var(--surface);
        box-shadow: var(--shadow-sm);
        transition: transform 0.1s ease;
        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .price-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;
      cursor: pointer;
      user-select: none;

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        background-color: var(--surface);
        border: 2px solid var(--border);
        border-radius: var(--radius-xs);
        position: relative;
        transition: all 0.2s ease;
      }

      input:checked ~ .checkmark {
        background-color: var(--accent);
        border-color: var(--accent);
      }

      .checkmark::after {
        content: "";
        position: absolute;
        display: none;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input:checked ~ .checkmark::after {
        display: block;
      }

      .label-text {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--text-secondary);
        transition: color 0.2s;
      }

      &:hover {
        .checkmark {
          border-color: var(--text-secondary);
        }
        .label-text {
          color: var(--text-primary);
        }
      }
    }

    .switch-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      .label-text {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-secondary);
      }

      input {
        display: none;
      }

      .switch {
        width: 44px;
        height: 24px;
        background: var(--border);
        border-radius: var(--radius-full);
        position: relative;
        transition: background-color 0.3s ease;

        &::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s ease;
        }
      }

      input:checked + .switch {
        background-color: var(--accent);
        &::after {
          transform: translateX(20px);
        }
      }
    }
  `]
})
export class FilterSidebarComponent {
   testDrive = model(false);
   carType = model('all');
   selectedBrands = model<string[]>([]);
   minPrice = model(0);
   maxPrice = model(1000);
   selectedFuels = model<string[]>([]);
   selectedTrans = model<string[]>([]);

   @Output() changed = new EventEmitter<void>();

   rangeValue = 1000;

   // Collapsed state tracking
   collapsedSections = signal<Record<string, boolean>>({
     type: false,
     brands: false,
     price: false,
     fuel: false,
     transmission: false,
     options: false
   });

   brands = [
     'Toyota', 'Honda', 'Chevrolet', 'Volkswagen', 'Fiat', 'Jeep',
     'Hyundai', 'Nissan', 'Renault', 'Ford', 'Peugeot', 'Citroën',
     'BMW', 'Mercedes-Benz', 'Tesla', 'BYD', 'Volvo', 'Mitsubishi',
     'Caoa Chery', 'GWM', 'Ram', 'Range Rover', 'Porsche'
   ];
   fuels = ['Flex', 'Gasolina', 'Elétrico', 'Híbrido', 'Diesel'];
   transmissions = ['Automático', 'Manual'];

   isCollapsed(section: string): boolean {
     return !!this.collapsedSections()[section];
   }

   toggleSection(section: string) {
     this.collapsedSections.update(prev => ({
       ...prev,
       [section]: !prev[section]
     }));
   }

   setCarType(type: string) { this.carType.set(type); this.changed.emit(); }

   toggleBrand(brand: string) {
      this.selectedBrands.update(prev =>
         prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
      );
      this.changed.emit();
   }

   onPriceChange() {
      this.maxPrice.set(this.rangeValue);
      this.changed.emit();
   }

   toggleFuel(fuel: string) {
      this.selectedFuels.update(prev =>
         prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
      );
      this.changed.emit();
   }

   toggleTrans(trans: string) {
      this.selectedTrans.update(prev =>
         prev.includes(trans) ? prev.filter(t => t !== trans) : [...prev, trans]
      );
      this.changed.emit();
   }

   toggleTestDrive() { this.testDrive.update(v => !v); this.changed.emit(); }

   clearAll() {
      this.testDrive.set(false);
      this.carType.set('all');
      this.selectedBrands.set([]);
      this.maxPrice.set(1000);
      this.rangeValue = 1000;
      this.selectedFuels.set([]);
      this.selectedTrans.set([]);
      this.changed.emit();
   }

   brandLogoFile(brand: string): string {
     const nameMap: Record<string, string> = {
       'Mercedes-Benz': 'mercedes-benz',
       'Caoa Chery': 'chery',
       'Range Rover': 'land-rover',
       'Citroën': 'citroen',
     };
     const fileName = nameMap[brand] || brand.toLowerCase();
     return `/assets/logos/${fileName}.png`;
   }

   onLogoError(event: Event, brand: string) {
     const img = event.target as HTMLImageElement;
     img.style.display = 'none';
     const fallback = img.nextElementSibling as HTMLElement;
     if (fallback) fallback.style.display = 'inline';
   }
}
