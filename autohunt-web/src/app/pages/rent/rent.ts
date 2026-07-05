import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../../core/services/car';
import { Vehicle, Page } from '../../core/models/vehicle.model';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar';
import { CarCardComponent } from '../../components/car-card/car-card';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card';
import { ActiveFiltersComponent, ActiveFilter } from '../../components/active-filters/active-filters';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
   selector: 'app-rent',
   standalone: true,
   imports: [
      CommonModule,
      FilterSidebarComponent,
      CarCardComponent,
      SearchBarComponent,
      SkeletonCardComponent,
      ActiveFiltersComponent,
      MatDatepickerModule,
      MatNativeDateModule,
      MatFormFieldModule,
      MatInputModule,
      FormsModule
   ],
   template: `
    <div class="rent-layout">
      <!-- Sidebar with Rental Pricing -->
      <aside class="sidebar-wrapper">
        <app-filter-sidebar 
          [(testDrive)]="testDrive"
          [(carType)]="carType"
          [(selectedBrands)]="selectedBrands"
          [(minPrice)]="minPrice"
          [(maxPrice)]="maxPrice"
          [(selectedFuels)]="selectedFuels"
          [(selectedTrans)]="selectedTrans"
        />

        <div class="rental-calendar glass">
           <h4>Rental Schedule</h4>
           <div class="date-inputs">
              <mat-form-field appearance="outline">
                <mat-label>Pickup Date</mat-label>
                <input matInput [matDatepicker]="picker1" [(ngModel)]="startDate" (dateChange)="calcDays()">
                <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
                <mat-datepicker #picker1></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Return Date</mat-label>
                <input matInput [matDatepicker]="picker2" [(ngModel)]="endDate" (dateChange)="calcDays()">
                <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
                <mat-datepicker #picker2></mat-datepicker>
              </mat-form-field>
           </div>
           
           @if (days() > 0) {
              <div class="cost-summary">
                 <div class="summary-row">
                    <span>Duration:</span>
                    <strong>{{ days() }} days</strong>
                 </div>
                 <p class="summary-info">Total rental cost will be calculated per car below.</p>
              </div>
           }
        </div>
      </aside>

      <!-- Main Content -->
      <section class="main-content">
        <div class="content-header">
           <app-search-bar [(searchQuery)]="searchQuery" />
        </div>

        <div class="results-info">
           <h2>{{ filteredVehicles().length }} Rental Options</h2>
           <div class="sort-dropdown">
              <select class="sort-select glass clickable" [(ngModel)]="sortBy">
                 <option value="recommended">Best Match</option>
                 <option value="price-asc">Price: Low to High</option>
                 <option value="price-desc">Price: High to Low</option>
              </select>
           </div>
        </div>

        <app-active-filters 
          [filters]="activeFilters()" 
          (remove)="removeFilter($event)" 
        />

        <div class="car-grid">
          @if (isLoading()) {
            @for (i of [1,2,3,4,5,6]; track i) {
               <app-skeleton-card />
            }
          } @else {
            @for (car of filteredVehicles(); track car.id) {
               <div class="rent-card-wrapper anim-card">
                  <app-car-card [car]="car" [showRentPrice]="true" />
                  @if (days() > 0) {
                     <div class="estimate-overlay">
                        Total: \${{ (car.pricePerDay * days()) | number }}
                     </div>
                  }
               </div>
            }
          }
        </div>
      </section>
    </div>
  `,
   styles: [`
    .rent-layout {
      display: grid; grid-template-columns: 320px 1fr; gap: 32px;
      padding: 32px 40px; max-width: 1600px; margin: 0 auto;
    }
    .main-content { min-width: 0; }
    .content-header { margin-bottom: 32px; display: flex; justify-content: center; }

    .rental-calendar {
       margin-top: 24px; padding: 20px;
       h4 { font-size: 1rem; font-weight: 800; margin-bottom: 20px; }
       .date-inputs { display: flex; flex-direction: column; gap: 8px; }
    }

    .cost-summary {
       margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--glass-border);
       .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; }
       .summary-info { font-size: 0.75rem; color: var(--text-light); text-align: center; font-style: italic; }
    }

    .results-info {
       display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
       h2 { font-size: 1.5rem; font-weight: 800; }
       .sort-select { padding: 8px 16px; border-radius: var(--radius-full); font-weight: 700; outline: none; }
    }

    .car-grid {
       display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;
    }

    .rent-card-wrapper { position: relative; }
    .estimate-overlay {
       position: absolute; bottom: 80px; right: 16px;
       background: var(--accent-green); color: white;
       padding: 4px 12px; border-radius: var(--radius-md);
       font-size: 0.85rem; font-weight: 800; box-shadow: 0 4px 10px rgba(16,185,129,0.3);
       animation: fadeIn 0.3s;
    }

    @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes cardIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    .anim-card { animation: cardIn 0.5s forwards; }

    ::ng-deep {
       .mat-mdc-form-field { width: 100%; }
       .mat-mdc-text-field-wrapper { background: rgba(0,0,0,0.02) !important; border-radius: 12px !important; }
       [data-theme='dark'] .mat-mdc-text-field-wrapper { background: rgba(255,255,255,0.05) !important; }
    }

    @media (max-width: 1024px) {
       .rent-layout { grid-template-columns: 1fr; }
       .sidebar-wrapper { display: none; }
    }
  `]
})
export class Rent implements OnInit {
   private carService = inject(CarService);

   isLoading = signal(true);
   vehicles = signal<Vehicle[]>([]);
   searchQuery = signal('');
   sortBy = signal('recommended');

   startDate: Date | null = null;
   endDate: Date | null = null;
   days = signal(0);

   // Filters
   testDrive = signal(false);
   carType = signal('all');
   selectedBrands = signal<string[]>([]);
   minPrice = signal(0);
   maxPrice = signal(500000);
   selectedFuels = signal<string[]>([]);
   selectedTrans = signal<string[]>([]);

   ngOnInit() {
      this.carService.getCars().subscribe((res: Page<Vehicle>) => {
         this.vehicles.set(res.content);
         this.isLoading.set(false);
      });
   }

   calcDays() {
      if (this.startDate && this.endDate) {
         const diff = this.endDate.getTime() - this.startDate.getTime();
         const d = Math.ceil(diff / (1000 * 3600 * 24));
         this.days.set(d > 0 ? d : 0);
      } else {
         this.days.set(0);
      }
   }

    filteredVehicles = computed(() => {
      let res = this.vehicles();
      
      // Location Filter
      const loc = this.carService.selectedLocation();
      if (loc && loc !== 'Todos') {
         const parts = loc.split(', ');
         if (parts.length === 2) {
            res = res.filter(v => v.city === parts[0] && v.state === parts[1]);
         }
      }

      // Search Query
      if (this.searchQuery()) {
         const q = this.searchQuery().toLowerCase();
         res = res.filter(v => 
            (v.name || '').toLowerCase().includes(q) || 
            (v.brand || '').toLowerCase().includes(q) ||
            (v.model || '').toLowerCase().includes(q)
         );
      }

      // Brands Filter
      if (this.selectedBrands().length > 0) {
         res = res.filter(v => this.selectedBrands().includes(v.brand));
      }

      // Price Filter
      res = res.filter(v => v.pricePerDay >= this.minPrice() && v.pricePerDay <= this.maxPrice());

      // Fuel Type Filter
      if (this.selectedFuels().length > 0) {
         const fuelMap: any = {
            'Flex': 'FLEX',
            'Gasolina': 'GASOLINE',
            'Elétrico': 'ELECTRIC',
            'Híbrido': 'HYBRID',
            'Diesel': 'DIESEL'
         };
         const mappedFuels = this.selectedFuels().map(f => fuelMap[f] || f.toUpperCase());
         res = res.filter(v => mappedFuels.includes(v.fuelType));
      }

      // Transmission Filter
      if (this.selectedTrans().length > 0) {
         const transMap: any = {
            'Automático': 'AUTOMATIC',
            'Manual': 'MANUAL'
         };
         const mappedTrans = this.selectedTrans().map(t => transMap[t] || t.toUpperCase());
         res = res.filter(v => mappedTrans.includes(v.transmission));
      }

      // Test Drive Filter
      if (this.testDrive()) {
         res = res.filter(v => v.freeTestDrive);
      }

      // Sort
      const sortVal = this.sortBy();
      if (sortVal === 'price-asc') {
         res = [...res].sort((a, b) => a.pricePerDay - b.pricePerDay);
      } else if (sortVal === 'price-desc') {
         res = [...res].sort((a, b) => b.pricePerDay - a.pricePerDay);
      }

      return res;
   });

   activeFilters = computed(() => {
      const filters: ActiveFilter[] = [];
      if (this.testDrive()) filters.push({ id: 'td', label: 'Free Test Drive', category: 'testDrive' });
      this.selectedBrands().forEach(b => filters.push({ id: `b-${b}`, label: b, category: 'brand' }));
      this.selectedFuels().forEach(f => filters.push({ id: `f-${f}`, label: f, category: 'fuel' }));
      this.selectedTrans().forEach(t => filters.push({ id: `t-${t}`, label: t, category: 'trans' }));
      if (this.minPrice() > 0 || this.maxPrice() < 500000) {
         filters.push({ id: 'pr', label: `R$ ${this.minPrice()} - R$ ${this.maxPrice()}`, category: 'price' });
      }
      return filters;
   });

   removeFilter(f: ActiveFilter) {
      if (f.category === 'testDrive') this.testDrive.set(false);
      if (f.category === 'brand') {
         const bName = f.id.replace('b-', '');
         this.selectedBrands.update(bs => bs.filter(b => b !== bName));
      }
      if (f.category === 'fuel') {
         const fName = f.id.replace('f-', '');
         this.selectedFuels.update(fs => fs.filter(val => val !== fName));
      }
      if (f.category === 'trans') {
         const tName = f.id.replace('t-', '');
         this.selectedTrans.update(ts => ts.filter(val => val !== tName));
      }
      if (f.category === 'price') {
         this.minPrice.set(0);
         this.maxPrice.set(500000);
      }
   }
}
