import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CarService } from '../../core/services/car';
import { Vehicle } from '../../core/models/vehicle.model';
import { RentalService } from '../../core/services/rental';
import { ToastService } from '../../core/services/toast';
import { AuthService } from '../../core/services/auth';
import { LoadingComponent } from '../../components/loading/loading';

@Component({
  selector: 'app-rental-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    LoadingComponent
  ],
  template: `
    <div class="wizard-container" *ngIf="car(); else loadingTpl">
      <div class="wizard-card animate-in">
        <div class="wizard-header">
          <h1>Reservar {{ car()?.brand }} {{ car()?.model }}</h1>
          <div class="steps-progress">
            <div class="step" [class.active]="step() >= 1" [class.done]="step() > 1">
              <span *ngIf="step() <= 1">1</span>
              <svg *ngIf="step() > 1" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="line" [class.done]="step() > 1"></div>
            <div class="step" [class.active]="step() >= 2" [class.done]="step() > 2">
              <span *ngIf="step() <= 2">2</span>
              <svg *ngIf="step() > 2" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="line" [class.done]="step() > 2"></div>
            <div class="step" [class.active]="step() >= 3">3</div>
          </div>
        </div>

        <!-- Step 1: Dates & Location -->
        <div class="step-content animate-fade" *ngIf="step() === 1">
          <h2>Período e Localização</h2>
          <div class="selection-grid">
            <div class="input-group">
              <label for="pickup-date">Data de Retirada</label>
              <input id="pickup-date" type="date" [(ngModel)]="startDate" class="form-input">
            </div>
            <div class="input-group">
              <label for="return-date">Data de Devolução</label>
              <input id="return-date" type="date" [(ngModel)]="endDate" class="form-input">
            </div>
            <div class="input-group">
              <label for="pickup-loc">Local de Retirada</label>
              <select id="pickup-loc" [(ngModel)]="pickup" class="form-input select-input">
                 <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="input-group">
              <label for="return-loc">Local de Devolução</label>
              <select id="return-loc" [(ngModel)]="returnLoc" class="form-input select-input">
                 <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <div class="actions">
            <button class="next-btn" (click)="nextStep()">Próximo Passo</button>
          </div>
        </div>

        <!-- Step 2: Options -->
        <div class="step-content animate-fade" *ngIf="step() === 2">
          <h2>Adicionais & Proteção</h2>
          <div class="options-list">
            <div class="option-item" (click)="insurance = !insurance" [class.selected]="insurance">
              <div class="check">
                <svg *ngIf="insurance" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="desc">
                 <strong>Proteção Completa</strong>
                 <p>Cobre danos, roubo e colisões por um preço fixo.</p>
              </div>
              <div class="price">+15% / dia</div>
            </div>
            
            <div class="option-item" (click)="addDriver = !addDriver" [class.selected]="addDriver">
              <div class="check">
                <svg *ngIf="addDriver" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="desc">
                 <strong>Condutor Adicional</strong>
                 <p>Permite que outra pessoa dirija o veículo legalmente.</p>
              </div>
              <div class="price">R$ 35,00 / dia</div>
            </div>
          </div>
          <div class="actions font-nav">
            <button class="back-link" (click)="step.set(1)">← Voltar</button>
            <button class="next-btn" (click)="nextStep()">Resumo da Reserva</button>
          </div>
        </div>

        <!-- Step 3: Summary -->
        <div class="step-content animate-fade" *ngIf="step() === 3">
          <h2>Resumo do Aluguel</h2>
          <div class="summary-card">
            <div class="sum-row">
              <span class="sum-label">Veículo</span>
              <span class="sum-value">{{ car()?.brand }} {{ car()?.model }}</span>
            </div>
            <div class="sum-row">
              <span class="sum-label">Período</span>
              <span class="sum-value">{{ startDate }} até {{ endDate }}</span>
            </div>
            <div class="sum-row">
              <span class="sum-label">Local de Retirada</span>
              <span class="sum-value">{{ pickup }}</span>
            </div>
            <div class="divider"></div>
            <div class="sum-row total">
              <span class="total-label">Total Estimado</span>
              <span class="total-value">R$ {{ calculateTotal() | number:'1.2-2' }}</span>
            </div>
          </div>
          <div class="actions font-nav">
            <button class="back-link" (click)="step.set(2)">← Voltar</button>
            <button class="confirm-btn" (click)="confirmBooking()" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Processando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <app-loading></app-loading>
    </ng-template>
  `,
  styles: [`
    .wizard-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .wizard-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 48px;
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
    }

    .wizard-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
      
      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 24px;
        color: var(--text-primary);
        text-align: center;
      }
    }

    .steps-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      max-width: 360px;
      
      .step {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: var(--text-secondary);
        background: var(--surface);
        transition: all 0.25s ease;
        flex-shrink: 0;

        .check-icon {
          width: 16px;
          height: 16px;
          color: white;
        }
        
        &.active {
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 800;
        }
        &.done {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--text-inverse);
        }
      }
      
      .line {
        flex: 1;
        height: 2px;
        background: var(--border);
        transition: background-color 0.25s ease;
        &.done {
          background: var(--accent);
        }
      }
    }

    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 28px;
      color: var(--text-primary);
      text-align: center;
    }

    .selection-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 36px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
      }
      
      .form-input {
        width: 100%;
        padding: 12px;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        outline: none;
        transition: all 0.2s ease;
        
        &:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
      }
      
      .select-input {
        appearance: none;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23536471' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
        padding-right: 36px;
      }
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 36px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      
      &:hover {
        border-color: var(--text-secondary);
      }
      
      &.selected {
        border-color: var(--accent);
        background: var(--accent-light);
      }
      
      .check {
        width: 24px;
        height: 24px;
        border: 2px solid var(--border);
        border-radius: var(--radius-xs);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background: var(--surface);
        flex-shrink: 0;
        
        svg {
          width: 14px;
          height: 14px;
          color: white;
        }
      }
      
      &.selected .check {
        background: var(--accent);
        border-color: var(--accent);
      }
      
      .desc {
        flex: 1;
        strong {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        p {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }
      }
      
      .price {
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: var(--accent);
      }
    }

    .summary-card {
      background: var(--surface-secondary);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 36px;
    }

    .sum-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      
      .sum-label {
        color: var(--text-secondary);
        font-weight: 500;
      }
      .sum-value {
        color: var(--text-primary);
        font-weight: 700;
      }
    }

    .divider {
      height: 1px;
      background: var(--border);
      margin: 4px 0;
    }

    .total {
      .total-label {
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
      }
      .total-value {
        font-family: 'Outfit', sans-serif;
        color: var(--accent);
        font-size: 24px;
        font-weight: 800;
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
    }
    
    .font-nav {
      justify-content: space-between;
    }

    .next-btn, .confirm-btn {
      padding: 14px 32px;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: var(--accent-hover);
      }
      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }

    .back-link {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
        background: var(--surface-secondary);
      }
    }

    .animate-fade {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 600px) {
      .wizard-card {
        padding: 32px 20px;
      }
      .selection-grid {
        grid-template-columns: 1fr;
      }
      .actions {
        flex-direction: column-reverse;
        gap: 16px;
        width: 100%;
        
        button {
          width: 100%;
          text-align: center;
        }
      }
    }
  `]
})
export class RentalWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);
  private rentalService = inject(RentalService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  car = signal<Vehicle | undefined>(undefined);
  step = signal(1);
  isSubmitting = signal(false);

  startDate = '';
  endDate = '';
  pickup = 'São Paulo, SP';
  returnLoc = 'São Paulo, SP';
  insurance = false;
  addDriver = false;

  cities = [
    'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
    'Curitiba, PR', 'Porto Alegre, RS', 'Brasília, DF',
    'Salvador, BA', 'Recife, PE', 'Fortaleza, CE'
  ];

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Acesso negado. Por favor, faça login.');
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe((params: any) => {
      const id = +params['id'];
      this.carService.getById(id).subscribe((car: Vehicle) => {
        this.car.set(car);
        this.pickup = car.city + ', ' + car.state;
        this.returnLoc = this.pickup;
      });
    });
  }

  nextStep() {
    if (this.step() === 1) {
      if (!this.startDate || !this.endDate) {
        this.toast.error('Selecione as datas de início e fim');
        return;
      }
      this.step.set(2);
    } else if (this.step() === 2) {
      this.step.set(3);
    }
  }

  calculateTotal() {
    const c = this.car();
    if (!c || !this.startDate || !this.endDate) return 0;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    let total = c.pricePerDay * days;
    if (this.insurance) total += total * 0.15;
    if (this.addDriver) total += 35 * days;

    return total;
  }

  confirmBooking() {
    this.isSubmitting.set(true);
    const data = {
      vehicleId: this.car()?.id,
      startDate: this.startDate,
      endDate: this.endDate,
      pickupLocation: this.pickup,
      returnLocation: this.returnLoc,
      insurance: this.insurance,
      additionalDriver: this.addDriver
    };

    this.rentalService.createRental(data).subscribe({
      next: () => {
        this.toast.success('Reserva realizada com sucesso!');
        this.router.navigate(['/my-rentals']);
      },
      error: (err: any) => {
        this.toast.error(err.error?.error || 'Erro ao realizar reserva');
        this.isSubmitting.set(false);
      }
    });
  }
}
