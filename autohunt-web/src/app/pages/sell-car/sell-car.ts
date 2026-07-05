import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../core/services/car';
import { ToastService } from '../../core/services/toast';

@Component({
   selector: 'app-sell-car',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="sell-container glass">
      <div class="wizard-header">
        <h1>Vender meu Veículo</h1>
        <div class="steps">
          <div class="step" [class.active]="step() >= 1" [class.done]="step() > 1">1<span>Básico</span></div>
          <div class="line"></div>
          <div class="step" [class.active]="step() >= 2" [class.done]="step() > 2">2<span>Tech</span></div>
          <div class="line"></div>
          <div class="step" [class.active]="step() >= 3" [class.done]="step() > 3">3<span>Preço</span></div>
          <div class="line"></div>
          <div class="step" [class.active]="step() >= 4">4<span>Review</span></div>
        </div>
      </div>

      <div class="step-content">
        <!-- Step 1 -->
        <div *ngIf="step() === 1" class="step-wrapper">
          <div class="input-grid">
            <div class="group">
              <label>Marca</label>
              <input type="text" [(ngModel)]="carData.brand" placeholder="Ex: Toyota" class="glass-input">
            </div>
            <div class="group">
              <label>Modelo</label>
              <input type="text" [(ngModel)]="carData.model" placeholder="Ex: Corolla" class="glass-input">
            </div>
            <div class="group">
              <label>Ano</label>
              <input type="number" [(ngModel)]="carData.year" placeholder="2024" class="glass-input">
            </div>
            <div class="group">
              <label>Categoria</label>
              <select [(ngModel)]="carData.category" class="glass-input">
                <option value="ECONOMY">Econômico</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxo</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div *ngIf="step() === 2" class="step-wrapper">
           <div class="input-grid">
            <div class="group">
              <label>Câmbio</label>
              <select [(ngModel)]="carData.transmission" class="glass-input">
                <option value="AUTOMATIC">Automático</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div class="group">
              <label>Combustível</label>
              <select [(ngModel)]="carData.fuelType" class="glass-input">
                <option value="FLEX">Flex</option>
                <option value="ELECTRIC">Elétrico</option>
                <option value="HYBRID">Híbrido</option>
              </select>
            </div>
            <div class="group">
              <label>Assentos</label>
              <input type="number" [(ngModel)]="carData.seats" class="glass-input">
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div *ngIf="step() === 3" class="step-wrapper">
          <div class="input-grid">
            <div class="group">
              <label>Preço Diária (R$)</label>
              <input type="number" [(ngModel)]="carData.pricePerDay" class="glass-input">
            </div>
            <div class="group">
              <label>Cidade</label>
              <input type="text" [(ngModel)]="carData.city" class="glass-input">
            </div>
            <div class="group">
              <label>Imagem URL</label>
              <input type="text" [(ngModel)]="carData.imageUrl" class="glass-input">
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div *ngIf="step() === 4" class="step-wrapper">
          <div class="summary glass">
             <h3>Confirmar Dados</h3>
             <p>{{ carData.brand }} {{ carData.model }} - {{ carData.year }}</p>
             <p>Preço: R$ {{ carData.pricePerDay }}</p>
             <p>Local: {{ carData.city }}</p>
          </div>
        </div>
      </div>

      <div class="actions">
        <button *ngIf="step() > 1" (click)="step.set(step() - 1)" class="back-btn">Voltar</button>
        <button *ngIf="step() < 4" (click)="step.set(step() + 1)" class="next-btn">Próximo</button>
        <button *ngIf="step() === 4" (click)="submit()" class="confirm-btn">Listar Veículo</button>
      </div>
    </div>
  `,
   styles: [`
    .sell-container { max-width: 900px; margin: 40px auto; padding: 40px; border-radius: var(--radius-lg); }
    .wizard-header { text-align: center; margin-bottom: 40px; h1 { font-size: 26px; font-weight: 900; margin-bottom: 20px; } }
    
    .steps {
      display: flex; align-items: center; justify-content: center; gap: 15px;
      .step {
        display: flex; flex-direction: column; align-items: center; gap: 5px;
        width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--glass-border);
        justify-content: center; font-weight: 800; font-size: 14px; position: relative;
        span { position: absolute; top: 45px; font-size: 10px; color: var(--text-light); text-transform: uppercase; width: 60px; text-align: center; }
        &.active { border-color: var(--accent-blue); color: var(--accent-blue); }
        &.done { background: var(--accent-blue); border-color: var(--accent-blue); color: white; }
      }
      .line { width: 40px; height: 2px; background: var(--glass-border); }
    }

    .step-content { min-height: 300px; margin-top: 40px; }
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .group { display: flex; flex-direction: column; gap: 8px; label { font-size: 13px; font-weight: 700; color: var(--text-light); } }
    .glass-input { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 12px; border-radius: var(--radius-md); color: var(--text-primary); outline: none; }
    
    .summary { padding: 30px; line-height: 2; h3 { margin-bottom: 15px; } }

    .actions { display: flex; justify-content: center; gap: 20px; margin-top: 40px; }
    .next-btn, .confirm-btn { padding: 12px 40px; background: var(--accent-blue); color: white; border-radius: var(--radius-md); font-weight: 700; }
    .back-btn { font-weight: 700; color: var(--text-light); cursor: pointer; }
  `]
})
export class SellCarComponent {
   private router = inject(Router);
   private toast = inject(ToastService);

   step = signal(1);
   carData: any = {
      brand: '', model: '', year: 2024, category: 'ECONOMY',
      transmission: 'AUTOMATIC', fuelType: 'FLEX', seats: 5,
      pricePerDay: 0, city: '', imageUrl: ''
   };

   submit() {
      this.toast.success('Veículo listado com sucesso! Aguarde aprovação.');
      this.router.navigate(['/']);
   }
}
