import { Component } from '@angular/core';

@Component({
    selector: 'app-skeleton-card',
    standalone: true,
    template: `
    <div class="skeleton-card glass">
      <div class="skeleton img-skeleton"></div>
      <div class="content">
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
        <div class="row">
          <div class="skeleton spec-skeleton"></div>
          <div class="skeleton spec-skeleton"></div>
          <div class="skeleton spec-skeleton"></div>
        </div>
        <div class="footer">
          <div class="skeleton price-skeleton"></div>
          <div class="skeleton btn-skeleton"></div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .skeleton-card { height: 380px; overflow: hidden; border-radius: var(--radius-lg); }
    .img-skeleton { width: 100%; height: 200px; }
    .content { padding: 16px; }
    .title-skeleton { width: 60%; height: 20px; margin-bottom: 8px; border-radius: 4px; }
    .text-skeleton { width: 40%; height: 14px; margin-bottom: 16px; border-radius: 4px; }
    .row { display: flex; gap: 8px; margin-bottom: 24px; }
    .spec-skeleton { width: 40px; height: 14px; border-radius: 4px; }
    .footer { display: flex; justify-content: space-between; align-items: center; }
    .price-skeleton { width: 80px; height: 24px; border-radius: 4px; }
    .btn-skeleton { width: 90px; height: 36px; border-radius: 20px; }
  `]
})
export class SkeletonCardComponent { }
