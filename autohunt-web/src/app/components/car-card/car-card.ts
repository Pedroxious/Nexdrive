import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Fuel, Settings2, Users, Heart, ArrowRight } from 'lucide-angular';
import { Vehicle } from '../../core/models/vehicle.model';
import { FavoriteService } from '../../core/services/favorites';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="car-card clickable" [routerLink]="['/car', car.id]">
      <!-- Badge -->
      <div class="badge-tag" *ngIf="car.badge" [class]="car.badge.toLowerCase()">
        {{ formatBadge(car.badge) }}
      </div>

      <!-- Image -->
      <div class="card-image">
        <img [src]="car.imageUrl" [alt]="car.brand + ' ' + car.model" loading="eager">
        <button class="fav-btn" (click)="toggleFavorite($event)" [class.active]="isFavorited()">

          <lucide-icon name="heart" [size]="18" [class.filled]="isFavorited()"></lucide-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="card-body">
        <div class="card-header">
          <div>
            <h3 class="car-name">{{ car.brand }} <strong>{{ car.model }}</strong></h3>
            <span class="car-sub">{{ translateCategory(car.categoryName) }} · {{ car.year }}</span>
          </div>
        </div>

        <div class="specs-row">
          <div class="spec">
            <lucide-icon name="fuel" [size]="14"></lucide-icon>
            <span>{{ translateFuel(car.fuelType) }}</span>
          </div>
          <div class="spec">
            <lucide-icon name="settings-2" [size]="14"></lucide-icon>
            <span>{{ translateTrans(car.transmission) }}</span>
          </div>
          <div class="spec">
            <lucide-icon name="users" [size]="14"></lucide-icon>
            <span>{{ car.seats }}L</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="price-block">
            <span class="price-label">{{ showRentPrice ? 'Total' : 'a partir de' }}</span>
            <div class="price-value">
              <span class="currency">R$</span>
              <span class="amount">{{ car.pricePerDay | number:'1.2-2':'pt-BR' }}</span>
              <span class="period" *ngIf="!showRentPrice">/dia</span>
            </div>
          </div>
          <button class="reserve-btn clickable" [routerLink]="['/rent', car.id]" (click)="$event.stopPropagation()">
            Ver detalhes
            <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .car-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      position: relative;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0, 191, 255, 0.15);
        border-color: rgba(0, 191, 255, 0.20);
      }
    }

    /* ── Badge ── */
    .badge-tag {
      position: absolute; top: 12px; left: 12px; z-index: 5;
      padding: 4px 10px; border-radius: var(--radius-full);
      font-size: 10px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.5px;

      &.best_seller { background: var(--error); color: #fff; }
      &.full_electric { background: var(--badge-electric); color: #fff; }
      &.new_release { background: #00BFFF; color: #0A1628; }
      &.hot_deal { background: var(--badge-hot); color: #fff; }
      &.free_test_drive { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
    }

    /* ── Image — separate hover ── */
    .card-image {
      height: 200px; overflow: hidden; position: relative;
      background: var(--surface-secondary);
      img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.5s ease, filter 0.3s ease;
      }
      &:hover img {
        transform: scale(1.06);
        filter: brightness(1.08);
      }
    }

    .fav-btn {
      position: absolute; top: 10px; right: 10px;
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(0,0,0,0.35); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; border: none; cursor: pointer;
      color: #fff;
      lucide-icon { transition: all 0.2s; }
      &:hover { background: rgba(0,0,0,0.55); transform: scale(1.1); }
      &.active {
        color: #EF4444;
        lucide-icon { fill: #EF4444; }
      }
    }

    /* ── Body ── */
    .card-body {
      padding: 16px 18px 18px;
      flex: 1; display: flex; flex-direction: column;
    }

    .card-header { margin-bottom: 14px; }
    .car-name {
      font-family: 'Outfit', sans-serif;
      font-size: 16px; font-weight: 500; color: var(--text-primary);
      strong { font-weight: 800; }
    }
    .car-sub {
      font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 2px; display: block;
    }

    /* ── Specs ── */
    .specs-row {
      display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap;
    }
    .spec {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 8px; border-radius: var(--radius-xs);
      background: var(--surface-secondary);
      font-size: 11px; font-weight: 600; color: var(--text-secondary);
      lucide-icon { color: var(--accent); }
    }

    /* ── Footer ── */
    .card-footer {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-top: auto; padding-top: 14px;
      border-top: 1px solid var(--border-light);
    }

    .price-block {
      display: flex; flex-direction: column;
    }
    .price-label {
      font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.2px;
    }
    .price-value {
      display: flex; align-items: baseline; gap: 2px;
    }
    .currency { font-size: 14px; font-weight: 700; color: #00BFFF; }
    .amount { font-size: 22px; font-weight: 700; color: #00BFFF; font-family: 'Outfit', sans-serif; line-height: 1; }
    .period { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-left: 2px; }

    .reserve-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 9px 16px; border-radius: 8px;
      background: transparent;
      color: #00BFFF;
      border: 1.5px solid #00BFFF;
      font-size: 12px; font-weight: 700;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      lucide-icon { transition: transform 0.2s; }
      &:hover {
        background: #00BFFF;
        color: #0A1628;
        border-color: #00BFFF;
        transform: scale(1.04);
        lucide-icon { transform: translateX(2px); }
      }
    }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .card-image { height: 170px; }
      .card-body { padding: 12px 14px 14px; }
      .card-header { margin-bottom: 10px; }
      .car-name { font-size: 14px; }
      .car-sub { font-size: 11px; }
      .specs-row { gap: 3px; margin-bottom: 12px; }
      .spec { padding: 3px 6px; font-size: 10px; }
      .card-footer { padding-top: 10px; }
      .amount { font-size: 18px; }
      .currency { font-size: 12px; }
      .period { font-size: 11px; }
      .reserve-btn { padding: 7px 12px; font-size: 11px; }
      .fav-btn { width: 30px; height: 30px; top: 8px; right: 8px; }
      .badge-tag { top: 8px; left: 8px; padding: 3px 8px; font-size: 9px; }
    }

    @media (max-width: 480px) {
      .card-image { height: 200px; }
      .car-card { border-radius: 12px; }
      .card-body { padding: 12px 14px 16px; }
      .car-name { font-size: 15px; }
      .amount { font-size: 20px; }
      .reserve-btn { padding: 8px 14px; font-size: 12px; }
    }
  `]
})
export class CarCardComponent {
  @Input({ required: true }) car!: Vehicle;
  @Input() showRentPrice: boolean = false;

  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isFavorited() {
    // This could optionally call favoriteService.checkFavorite, but for performance 
    // it's better if favorited status is part of the car object from backend.
    return false;
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Faça login para favoritar veículos');
      return;
    }
    this.favoriteService.toggleFavorite(this.car.id).subscribe(() => {
      this.toastService.success('Lista de desejos atualizada');
    });
  }

  formatBadge(badge: string) {
    return badge.replace('_', ' ');
  }

  translateCategory(cat: string) {
    const cats: any = {
      'ECONOMY': 'Econômico', 'COMPACT': 'Compacto', 'SUV': 'SUV',
      'LUXURY': 'Luxo', 'SPORT': 'Esportivo', 'VAN': 'Van',
      'SEDAN': 'Sedã', 'HATCH': 'Hatch', 'PICKUP': 'Picape'
    };
    return cats[cat] || cat;
  }

  translateFuel(fuel: string) {
    const map: any = { 'FLEX': 'Flex', 'GASOLINE': 'Gasolina', 'DIESEL': 'Diesel', 'ELECTRIC': 'Elétrico', 'HYBRID': 'Híbrido', 'ETHANOL': 'Etanol' };
    return map[fuel] || fuel;
  }

  translateTrans(t: string) {
    const map: any = { 'AUTOMATIC': 'Auto', 'MANUAL': 'Manual', 'CVT': 'CVT' };
    return map[t] || t;
  }
}
