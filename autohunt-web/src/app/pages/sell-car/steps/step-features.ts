import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-container">
      <h2 class="step-title">Ficha Técnica</h2>
      
      <div class="form-group">
        <label>Combustível</label>
        <div class="card-grid">
          <button type="button" *ngFor="let fuel of fuels" 
                  class="card-btn" 
                  [class.active]="carData.fuel === fuel"
                  (click)="selectFuel(fuel)">
            {{ fuel }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Câmbio</label>
        <div class="card-grid">
          <button type="button" *ngFor="let trans of transmissions" 
                  class="card-btn" 
                  [class.active]="carData.transmission === trans"
                  (click)="selectTransmission(trans)">
            {{ trans }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Tração</label>
        <div class="card-grid">
          <button type="button" *ngFor="let trac of tractions" 
                  class="card-btn" 
                  [class.active]="carData.traction === trac"
                  (click)="selectTraction(trac)">
            {{ trac }}
          </button>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Cor do veículo</label>
          <input type="color" [(ngModel)]="carData.color" (ngModelChange)="updateData()" class="color-picker" />
        </div>

        <div class="form-group flex-1">
          <label>Quilometragem</label>
          <input type="text" [ngModel]="formatKm(carData.mileage)" (ngModelChange)="updateMileage($event)" class="form-control" placeholder="0 km" />
        </div>
      </div>

      <div class="form-row counters">
        <div class="form-group">
          <label>Portas</label>
          <div class="stepper">
            <button type="button" (click)="updateDoors(-1)">-</button>
            <span>{{ carData.doors || 4 }}</span>
            <button type="button" (click)="updateDoors(1)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label>Lugares</label>
          <div class="stepper">
            <button type="button" (click)="updateSeats(-1)">-</button>
            <span>{{ carData.seats || 5 }}</span>
            <button type="button" (click)="updateSeats(1)">+</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease-out; }
    .step-title { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-row { display: flex; gap: 1rem; align-items: flex-end; }
    .flex-1 { flex: 1; }
    label { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
    .form-control { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: var(--accent); }
    .color-picker { width: 48px; height: 48px; padding: 0; border: none; border-radius: 8px; cursor: pointer; background: transparent; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.75rem; }
    .card-btn { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
    .card-btn:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.05); }
    .card-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
    .stepper { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--surface); }
    .stepper button { flex: 1; padding: 0.75rem 1rem; background: transparent; border: none; font-size: 1.125rem; cursor: pointer; color: var(--text-primary); transition: background 0.2s; }
    .stepper button:hover { background: rgba(var(--accent-rgb), 0.1); }
    .stepper span { flex: 1; text-align: center; font-weight: 500; min-width: 40px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepFeaturesComponent {
  @Input() carData: any = {};
  @Output() carDataChange = new EventEmitter<any>();

  fuels = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Elétrico', 'Híbrido', 'GNV'];
  transmissions = ['Automático', 'Manual', 'CVT', 'Automatizado'];
  tractions = ['4x2', '4x4', 'AWD', 'Dianteira', 'Traseira'];

  ngOnInit() {
    this.carData.doors = this.carData.doors || 4;
    this.carData.seats = this.carData.seats || 5;
    this.carData.color = this.carData.color || '#ffffff';
  }

  selectFuel(fuel: string) { this.carData.fuel = fuel; this.updateData(); }
  selectTransmission(trans: string) { this.carData.transmission = trans; this.updateData(); }
  selectTraction(trac: string) { this.carData.traction = trac; this.updateData(); }

  updateDoors(delta: number) {
    const val = (this.carData.doors || 4) + delta;
    if (val >= 2 && val <= 6) {
      this.carData.doors = val;
      this.updateData();
    }
  }

  updateSeats(delta: number) {
    const val = (this.carData.seats || 5) + delta;
    if (val >= 1 && val <= 9) {
      this.carData.seats = val;
      this.updateData();
    }
  }

  formatKm(value: any): string {
    if (!value) return '';
    const num = String(value).replace(/\D/g, '');
    return num ? parseInt(num, 10).toLocaleString('pt-BR') + ' km' : '';
  }

  updateMileage(value: string) {
    const num = value.replace(/\D/g, '');
    this.carData.mileage = num ? parseInt(num, 10) : null;
    this.updateData();
  }

  updateData() {
    this.carDataChange.emit(this.carData);
  }
}
