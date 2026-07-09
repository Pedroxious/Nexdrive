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
        <div class="toast" [class]="toast.type">
          <div class="icon" [ngSwitch]="toast.type">
            <svg *ngSwitchCase="'success'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <svg *ngSwitchCase="'error'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <svg *ngSwitchCase="'warning'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <svg *ngSwitchDefault viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          
          <p class="message">{{ toast.message }}</p>
          
          <button class="close-btn" (click)="toastService.remove(toast.message)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 320px;
      padding: 16px 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 4px solid var(--info);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      
      &.success {
        border-left-color: var(--success);
        .icon { color: var(--success); }
      }
      &.error {
        border-left-color: var(--error);
        .icon { color: var(--error); }
      }
      &.warning {
        border-left-color: var(--warning);
        .icon { color: var(--warning); }
      }
      &.info {
        border-left-color: var(--info);
        .icon { color: var(--info); }
      }
    }
    
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .message {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
      flex: 1;
      line-height: 1.4;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s, color 0.2s;
      
      &:hover {
        background-color: var(--surface-secondary);
        color: var(--text-primary);
      }
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
