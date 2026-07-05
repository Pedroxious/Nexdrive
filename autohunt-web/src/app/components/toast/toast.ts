import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.message) {
        <div class="toast glass" [class]="toast.type">
          <span class="material-symbols-outlined icon">
            {{ getIcon(toast.type) }}
          </span>
          <p class="message">{{ toast.message }}</p>
          <button class="close-btn" (click)="toastService.remove(toast.message)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed; top: 24px; right: 24px; z-index: 2000;
      display: flex; flex-direction: column; gap: 12px;
    }
    .toast {
      display: flex; align-items: center; gap: 12px; min-width: 300px;
      padding: 16px 20px; animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 4px solid var(--accent-blue);
      &.success { border-left-color: var(--accent-green); .icon { color: var(--accent-green); } }
      &.error { border-left-color: var(--accent-red); .icon { color: var(--accent-red); } }
      &.warning { border-left-color: var(--accent-orange); .icon { color: var(--accent-orange); } }
      &.info { border-left-color: var(--accent-blue); .icon { color: var(--accent-blue); } }
    }
    .message { font-size: 0.9rem; font-weight: 500; flex: 1; }
    .close-btn { color: var(--text-light); font-size: 18px; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);

    getIcon(type: string) {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    }
}
