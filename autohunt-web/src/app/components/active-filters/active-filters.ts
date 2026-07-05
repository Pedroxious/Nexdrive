import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActiveFilter {
  id: string;
  label: string;
  category: string;
}

@Component({
  selector: 'app-active-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="active-filters-container">
      @if (filters().length > 0) {
        <div class="chips-row">
          @for (filter of filters(); track filter.id) {
            <div class="filter-chip animate-in">
              <span class="chip-label">{{ filter.label }}</span>
              <button class="remove-btn" (click)="remove.emit(filter)" aria-label="Remover filtro">
                <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          }
          <button class="reset-all" (click)="clearAll.emit()">Limpar todos</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .active-filters-container {
      margin-bottom: 24px;
      min-height: 32px;
    }
    .chips-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      border: 1px solid var(--border);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--accent);
        background: var(--accent-light);
        color: var(--accent);
        .close-icon {
          color: var(--accent);
        }
      }
    }
    .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: 2px;
      cursor: pointer;
      border-radius: 50%;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--border-light);
      }
    }
    .close-icon {
      width: 14px;
      height: 14px;
      color: var(--text-secondary);
      transition: color 0.2s ease;
    }
    .reset-all {
      background: none;
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-left: 8px;
      cursor: pointer;
      text-decoration: underline;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--accent);
        background-color: var(--surface-secondary);
      }
    }
    .animate-in {
      animation: chipIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes chipIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ActiveFiltersComponent {
  filters = input<ActiveFilter[]>([]);
  remove = output<ActiveFilter>();
  clearAll = output<void>();
}
