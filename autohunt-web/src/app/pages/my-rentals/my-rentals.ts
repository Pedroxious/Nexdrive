import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RentalService } from '../../core/services/rental';
import { ToastService } from '../../core/services/toast';
import { LanguageService } from '../../core/services/language';
import { LoadingComponent } from '../../components/loading/loading';

@Component({
    selector: 'app-my-rentals',
    standalone: true,
    imports: [CommonModule, RouterLink, LoadingComponent],
    template: `
    <div class="rentals-container">
      <div class="header">
        <h1>{{ langService.t('my_rentals.title') }}</h1>
        <p>{{ langService.t('my_rentals.subtitle') }}</p>
      </div>

      <div class="rentals-list" *ngIf="!isLoading(); else loadingTpl">
        @for (rental of rentals(); track rental.id) {
          <div class="rental-card glass">
            <div class="img-wrap">
              <img [src]="rental.vehicle.imageUrl" alt="Veículo">
            </div>
            
            <div class="content">
              <div class="info">
                <h3>{{ rental.vehicle.brand }} {{ rental.vehicle.model }}</h3>
                <div class="status-badge" [class]="rental.status.toLowerCase()">
                  {{ translateStatus(rental.status) }}
                </div>
              </div>
              
              <div class="details">
                <div class="det-item">
                   <span class="label">{{ langService.t('search.dates') }}</span>
                   <span class="val">{{ rental.startDate }} - {{ rental.endDate }}</span>
                </div>
                <div class="det-item">
                   <span class="label">{{ langService.t('car.location') }}</span>
                   <span class="val">{{ rental.pickupLocation }}</span>
                </div>
                <div class="det-item">
                   <span class="label">{{ langService.t('wizard.total_estimated') }}</span>
                   <span class="val">R$ {{ rental.totalPrice | number:'1.2-2':'pt-BR' }}</span>
                </div>
              </div>

              <div class="actions" *ngIf="rental.status === 'PENDING' || rental.status === 'CONFIRMED'">
                <button class="cancel-link" (click)="cancel(rental.id)">{{ langService.t('my_rentals.cancel_booking') }}</button>
              </div>
            </div>
          </div>
        }

        <div class="empty-state" *ngIf="rentals().length === 0">
           <span class="icon">📅</span>
           <h3>{{ langService.t('my_rentals.empty') }}</h3>
           <p>{{ langService.t('my_rentals.subtitle') }}</p>
           <button class="browse-btn" routerLink="/">{{ langService.t('my_rentals.rent_first') }}</button>
        </div>
      </div>

      <ng-template #loadingTpl>
        <app-loading></app-loading>
      </ng-template>
    </div>
  `,
    styles: [`
    .rentals-container { padding: 40px 20px; max-width: 1000px; margin: 0 auto; }
    .header { margin-bottom: 40px; h1 { font-size: 28px; font-weight: 900; margin-bottom: 10px; } p { color: var(--text-secondary); } }
    
    .rentals-list { display: flex; flex-direction: column; gap: 20px; }

    .rental-card {
      display: flex; padding: 24px; border-radius: var(--radius-lg); gap: 24px;
      .img-wrap { width: 220px; height: 140px; border-radius: var(--radius-md); overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
      .content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
      .info { display: flex; justify-content: space-between; align-items: flex-start; h3 { font-size: 20px; font-weight: 800; } }
    }

    .status-badge {
      padding: 6px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 800; text-transform: uppercase;
      &.pending { background: rgba(245, 158, 11, 0.1); color: var(--accent-orange, #F59E0B); }
      &.confirmed { background: rgba(16, 185, 129, 0.1); color: var(--accent-green, #10B981); }
      &.cancelled { background: rgba(239, 68, 68, 0.1); color: var(--accent-red, #EF4444); }
      &.completed { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue, #3B82F6); }
    }

    .details {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0;
      .det-item { display: flex; flex-direction: column; gap: 4px; .label { font-size: 12px; color: var(--text-light); font-weight: 700; } .val { font-size: 14px; font-weight: 700; } }
    }

    .cancel-link { font-size: 13px; font-weight: 700; color: var(--accent-red, #EF4444); text-decoration: underline; background: none; border: none; cursor: pointer; }

    .empty-state {
        text-align: center; padding: 80px 0;
        .icon { font-size: 60px; display: block; margin-bottom: 20px; }
        h3 { font-size: 24px; margin-bottom: 10px; }
        p { color: var(--text-secondary); margin-bottom: 30px; }
        .browse-btn { background: var(--accent-blue, #0284C7); color: white; padding: 12px 32px; border-radius: var(--radius-full); font-weight: 700; border: none; cursor: pointer; }
    }

    @media (max-width: 768px) {
      .rental-card { flex-direction: column; .img-wrap { width: 100%; height: 180px; } }
      .details { grid-template-columns: 1fr; gap: 15px; }
    }
  `]
})
export class MyRentalsComponent implements OnInit {
    private rentalService = inject(RentalService);
    private toast = inject(ToastService);
    langService = inject(LanguageService);

    rentals = signal<any[]>([]);
    isLoading = signal(true);

    ngOnInit() {
        this.loadRentals();
    }

    loadRentals() {
        this.isLoading.set(true);
        this.rentalService.getMyRentals().subscribe({
            next: (data) => {
                this.rentals.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    cancel(id: number) {
        if (confirm('Cancel this booking?')) {
            this.rentalService.cancelRental(id).subscribe(() => {
                this.toast.success('Booking cancelled');
                this.loadRentals();
            });
        }
    }

    translateStatus(status: string) {
        const s: Record<string, string> = {
            'PENDING': this.langService.t('my_rentals.status_pending'),
            'CONFIRMED': this.langService.t('my_rentals.status_confirmed'),
            'CANCELLED': this.langService.t('my_rentals.status_cancelled'),
            'COMPLETED': this.langService.t('my_rentals.status_completed')
        };
        return s[status] || status;
    }
}
