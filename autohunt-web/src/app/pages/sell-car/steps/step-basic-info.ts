import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-basic-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-container">
      <h2 class="step-title">Informações Básicas</h2>
      
      <div class="form-group">
        <label>Marca</label>
        <!-- Replace with <app-brand-selector> when available -->
        <input type="text" [(ngModel)]="carData.brand" (ngModelChange)="updateData()" class="form-control" placeholder="Ex: Toyota" />
      </div>

      <div class="form-group">
        <label>Modelo</label>
        <input type="text" [(ngModel)]="carData.model" (ngModelChange)="updateData()" class="form-control" placeholder="Ex: Corolla" />
      </div>

      <div class="form-group">
        <label>Ano do veículo</label>
        <div class="year-grid">
          <button type="button" *ngFor="let year of years" 
                  class="year-btn" 
                  [class.active]="carData.year === year"
                  (click)="selectYear(year)">
            {{ year }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Categoria</label>
        <!-- Replace with <app-card-selector> when available -->
        <div class="category-grid">
          <button type="button" *ngFor="let cat of categories" 
                  class="category-btn" 
                  [class.active]="carData.category === cat"
                  (click)="selectCategory(cat)">
            {{ cat }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease-out; }
    .step-title { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
    .form-control { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: var(--accent); }
    .year-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.5rem; max-height: 200px; overflow-y: auto; padding-right: 0.5rem; }
    .year-btn, .category-btn { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
    .year-btn:hover, .category-btn:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.05); }
    .year-btn.active, .category-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
    .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepBasicInfoComponent {
  @Input() carData: any = {};
  @Output() carDataChange = new EventEmitter<any>();
  @Output() validChange = new EventEmitter<boolean>();

  years = Array.from({length: 32}, (_, i) => 2026 - i);
  categories = ['SUV', 'Sedan', 'Hatch', 'Pickup', 'Coupé', 'Conversível', 'Perua', 'Van', 'Minivan', 'Utilitário'];

  selectYear(year: number) {
    this.carData.year = year;
    this.updateData();
  }

  selectCategory(category: string) {
    this.carData.category = category;
    this.updateData();
  }

  updateData() {
    this.carDataChange.emit(this.carData);
    this.validate();
  }

  validate() {
    const isValid = !!(this.carData.brand && this.carData.model && this.carData.year && this.carData.category);
    this.validChange.emit(isValid);
  }
}
