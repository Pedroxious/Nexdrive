import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-card-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-grid" [style.grid-template-columns]="'repeat(' + gridCols + ', minmax(0, 1fr))'">
      @for (option of options; track option.value) {
        <div 
          class="selector-card" 
          [class.selected]="selected === option.value"
          (click)="selectOption(option.value)"
          (keydown.enter)="selectOption(option.value)"
          tabindex="0"
        >
          @if (selected === option.value) {
            <div class="check-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          }
          
          @if (option.icon) {
            <div class="icon-container" [innerHTML]="option.icon"></div>
          }
          
          <div class="card-content">
            <span class="card-label">{{ option.label }}</span>
            @if (option.description) {
              <span class="card-description">{{ option.description }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .card-grid {
      display: grid;
      gap: 1rem;
    }
    .selector-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border, #374151);
      background: var(--surface, #111827);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-align: center;
      gap: 0.75rem;
      overflow: hidden;
    }
    .selector-card:hover {
      transform: translateY(-2px);
      border-color: var(--text-secondary, #9ca3af);
      background: var(--bg-main, #1f2937);
    }
    .selector-card.selected {
      border-color: var(--accent, #06b6d4);
      background: rgba(6, 182, 212, 0.05);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
    }
    .check-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 1.25rem;
      height: 1.25rem;
      background: var(--accent, #06b6d4);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .check-badge svg {
      width: 100%;
      height: 100%;
    }
    .icon-container {
      width: 2rem;
      height: 2rem;
      color: var(--text-primary, #f9fafb);
    }
    .selector-card.selected .icon-container {
      color: var(--accent, #06b6d4);
    }
    .card-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .card-label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary, #f9fafb);
    }
    .card-description {
      font-size: 0.75rem;
      color: var(--text-secondary, #9ca3af);
    }
    @keyframes popIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class CardSelectorComponent {
  @Input() options: CardOption[] = [];
  @Input() selected = '';
  @Input() gridCols = 3;
  @Output() selectedChange = new EventEmitter<string>();

  selectOption(value: string) {
    this.selected = value;
    this.selectedChange.emit(value);
  }
}
