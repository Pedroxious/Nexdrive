import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="color-grid">
      @for (color of colors; track color.hex) {
        <div class="color-item" (click)="selectColor(color.name)" (keydown.enter)="selectColor(color.name)" tabindex="0">
          <div 
            class="color-swatch" 
            [style.background-color]="color.hex"
            [class.selected]="selectedColor === color.name"
            [class.light-color]="isLight(color.hex)"
          >
            @if (selectedColor === color.name) {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            }
          </div>
          <span class="color-name" [class.selected]="selectedColor === color.name">{{ color.name }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 1.5rem 1rem;
      padding: 0.5rem 0;
    }
    .color-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      outline: none;
    }
    .color-item:hover .color-swatch:not(.selected) {
      transform: scale(1.1);
    }
    .color-swatch {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid var(--border, #374151);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }
    .color-swatch.selected {
      transform: scale(1.1);
      border-color: var(--accent, #06b6d4);
      box-shadow: 0 0 0 2px var(--surface, #111827), 0 0 0 4px var(--accent, #06b6d4);
    }
    .check-icon {
      width: 24px;
      height: 24px;
      color: #fff;
      animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .light-color.selected .check-icon {
      color: #000;
    }
    .color-name {
      font-size: 0.75rem;
      color: var(--text-secondary, #9ca3af);
      font-weight: 500;
      text-align: center;
      transition: color 0.2s;
    }
    .color-name.selected {
      color: var(--accent, #06b6d4);
      font-weight: 600;
    }
    @keyframes pop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ColorPickerComponent {
  @Input() selectedColor = '';
  @Output() colorChange = new EventEmitter<string>();

  colors = [
    { name: 'Branco', hex: '#FFFFFF' },
    { name: 'Preto', hex: '#000000' },
    { name: 'Prata', hex: '#C0C0C0' },
    { name: 'Cinza', hex: '#808080' },
    { name: 'Vermelho', hex: '#EF4444' },
    { name: 'Azul', hex: '#3B82F6' },
    { name: 'Verde', hex: '#10B981' },
    { name: 'Amarelo', hex: '#EAB308' },
    { name: 'Marrom', hex: '#78350F' },
    { name: 'Bege', hex: '#F5F5DC' },
    { name: 'Laranja', hex: '#F97316' },
    { name: 'Vinho', hex: '#800020' },
    { name: 'Dourado', hex: '#D4AF37' }
  ];

  selectColor(name: string) {
    this.selectedColor = name;
    this.colorChange.emit(name);
  }

  isLight(hex: string): boolean {
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
  }
}
