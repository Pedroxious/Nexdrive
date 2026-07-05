import { Component } from '@angular/core';

@Component({
    selector: 'app-loading',
    standalone: true,
    template: `
    <div class="loader-wrap">
      <div class="spinner"></div>
      <p>Nexdrive</p>
    </div>
  `,
    styles: [`
    .loader-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      width: 100%;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--glass-border);
      border-top: 4px solid var(--accent-blue);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    p { margin-top: 15px; font-weight: 700; color: var(--text-light); letter-spacing: 1px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class LoadingComponent { }
