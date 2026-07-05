import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../core/services/favorites';
import { CarCardComponent } from '../../components/car-card/car-card';
import { LoadingComponent } from '../../components/loading/loading';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, CarCardComponent, LoadingComponent],
  template: `
    <div class="favorites-container">
      <div class="header">
        <h1>Meus Favoritos</h1>
        <p>Sua lista personalizada de veículos que você amou.</p>
      </div>

      <div class="fav-grid" *ngIf="!isLoading(); else loadingTpl">
        @for (fav of favorites(); track fav.id) {
           <app-car-card [car]="fav.vehicle"></app-car-card>
        }

        <div class="empty-state" *ngIf="favorites().length === 0">
           <span class="icon">❤️</span>
           <h3>Nada por aqui ainda</h3>
           <p>Adicione veículos aos seus favoritos para salvá-los para depois.</p>
        </div>
      </div>

      <ng-template #loadingTpl>
        <app-loading></app-loading>
      </ng-template>
    </div>
  `,
  styles: [`
    .favorites-container { padding: 40px 20px; max-width: 1440px; margin: 0 auto; }
    .header { margin-bottom: 40px; }
    .fav-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;
    }
    .empty-state {
        grid-column: 1 / -1; text-align: center; padding: 100px 0;
        .icon { font-size: 60px; display: block; margin-bottom: 20px; }
    }
  `]
})
export class FavoritesComponent implements OnInit {
  private favService = inject(FavoriteService);
  favorites = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.favService.getMyFavorites().subscribe(data => {
      this.favorites.set(data);
      this.isLoading.set(false);
    });
  }
}
