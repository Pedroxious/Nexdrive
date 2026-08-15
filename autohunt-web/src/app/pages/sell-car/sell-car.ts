import { Component, inject, signal, OnInit, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast';
import { StepBasicInfoComponent } from './steps/step-basic-info';
import { StepFeaturesComponent } from './steps/step-features';
import { StepPhotosComponent } from './steps/step-photos';
import { StepPriceComponent } from './steps/step-price';
import { StepReviewComponent } from './steps/step-review';
import { LivePreviewPanelComponent } from './components/live-preview-panel';
import { AdQualityMeterComponent } from './components/ad-quality-meter';

export interface CarDataDraft {
  brand: string;
  customBrand?: string;
  model: string;
  year: number;
  category: string;
  fuelType: string;
  transmission: string;
  traction?: string;
  color: string;
  mileage: number;
  seats: number;
  doors: number;
  images: string[];
  imageUrl?: string;
  pricePerDay: number;
  salePrice?: number;
  city: string;
  state: string;
  description: string;
  freeTestDrive: boolean;
  isNew: boolean;
}

@Component({
  selector: 'app-sell-car',
  standalone: true,
  imports: [
    CommonModule,
    StepBasicInfoComponent,
    StepFeaturesComponent,
    StepPhotosComponent,
    StepPriceComponent,
    StepReviewComponent,
    LivePreviewPanelComponent,
    AdQualityMeterComponent
  ],
  template: `
    <div class="sell-car-page">
      <div class="page-container">
        
        <!-- Header -->
        <header class="wizard-header">
          <div class="header-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>Anúncio Premium</span>
          </div>
          <h1>Anuncie seu Veículo na Nexdrive</h1>
          <p class="subtitle">Cadastre seu carro em poucos passos e alcance milhares de clientes qualificados</p>
        </header>

        <!-- Stepper Navigation Bar -->
        <nav class="stepper-nav">
          <div class="stepper-track">
            <div class="stepper-progress" [style.width.%]="(step() - 1) * 25"></div>

            @for (item of stepsList; track $index; let idx = $index) {
              <div 
                class="step-item"
                [class.active]="step() === idx + 1"
                [class.completed]="step() > idx + 1"
                (click)="goToStep(idx + 1)"
              >
                <div class="step-circle">
                  <ng-container *ngIf="step() > idx + 1; else stepNum">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </ng-container>
                  <ng-template #stepNum>{{ idx + 1 }}</ng-template>
                </div>
                <span class="step-label">{{ item.label }}</span>
              </div>
            }
          </div>
        </nav>

        <!-- Main Split Layout (Form + Sticky Preview Sidebar) -->
        <div class="wizard-split">
          
          <!-- Primary Form Column -->
          <main class="wizard-main">
            <div class="step-card glass-panel">

              <!-- Step 1: Basic Info -->
              <div *ngIf="step() === 1" class="fade-in">
                <app-step-basic-info 
                  [carData]="carData()" 
                  (carDataChange)="onCarDataUpdate($event)"
                ></app-step-basic-info>
              </div>

              <!-- Step 2: Specs & Tech -->
              <div *ngIf="step() === 2" class="fade-in">
                <app-step-features 
                  [carData]="carData()" 
                  (carDataChange)="onCarDataUpdate($event)"
                ></app-step-features>
              </div>

              <!-- Step 3: Photos & Media -->
              <div *ngIf="step() === 3" class="fade-in">
                <app-step-photos 
                  [carData]="carData()" 
                  (carDataChange)="onCarDataUpdate($event)"
                ></app-step-photos>
              </div>

              <!-- Step 4: Price & Local AI Description -->
              <div *ngIf="step() === 4" class="fade-in">
                <app-step-price 
                  [carData]="carData()" 
                  (carDataChange)="onCarDataUpdate($event)"
                ></app-step-price>
              </div>

              <!-- Step 5: Final Ad Review -->
              <div *ngIf="step() === 5" class="fade-in">
                <app-step-review 
                  [carData]="carData()" 
                  [isSubmitting]="isSubmitting()"
                  (submitAd)="submitListing()"
                ></app-step-review>
              </div>

              <!-- Wizard Actions Footer -->
              <div class="wizard-actions">
                <button 
                  *ngIf="step() > 1" 
                  type="button" 
                  class="btn-secondary" 
                  (click)="prevStep()"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Voltar
                </button>

                <div class="spacer"></div>

                <button 
                  *ngIf="step() < 5" 
                  type="button" 
                  class="btn-primary" 
                  (click)="nextStep()"
                >
                  Continuar
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>

            </div>
          </main>

          <!-- Sticky Right Sidebar Column -->
          <aside class="wizard-sidebar">
            <!-- Quality Score Meter -->
            <app-ad-quality-meter [carData]="carData()"></app-ad-quality-meter>

            <!-- Sticky Live Preview Card -->
            <app-live-preview-panel 
              [carData]="carData()"
              [lastSaved]="lastSaved()"
              [isSaving]="isSaving()"
            ></app-live-preview-panel>
          </aside>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .sell-car-page {
      min-height: 100vh;
      background: var(--bg-main);
      padding: 40px 24px 80px;
    }

    .page-container {
      max-width: 1280px;
      margin: 0 auto;
    }

    .wizard-header {
      text-align: center;
      margin-bottom: 32px;

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: rgba(0, 191, 234, 0.1);
        border: 1px solid rgba(0, 191, 234, 0.2);
        border-radius: 20px;
        color: var(--accent);
        font-family: 'Outfit', sans-serif;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }

      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 32px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.5px;
        margin-bottom: 8px;
      }

      .subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 15px;
        color: var(--text-secondary);
      }
    }

    /* Stepper Nav */
    .stepper-nav {
      margin-bottom: 36px;
      padding: 0 20px;
    }

    .stepper-track {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 900px;
      margin: 0 auto;

      &::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--border);
        z-index: 1;
      }
    }

    .stepper-progress {
      position: absolute;
      top: 20px;
      left: 0;
      height: 3px;
      background: var(--accent);
      z-index: 2;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .step-item {
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .step-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--surface);
      border: 2px solid var(--border);
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      .step-item.active & {
        border-color: var(--accent);
        color: var(--accent);
        box-shadow: 0 0 0 4px rgba(0, 191, 234, 0.15);
      }

      .step-item.completed & {
        background: var(--accent);
        border-color: var(--accent);
        color: white;
      }
    }

    .step-label {
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-muted);
      transition: color 0.3s ease;

      .step-item.active & { color: var(--text-primary); font-weight: 700; }
      .step-item.completed & { color: var(--text-secondary); }
    }

    /* Split Grid */
    .wizard-split {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    .glass-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 36px;
      box-shadow: var(--shadow-md);
    }

    .wizard-sidebar {
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: sticky;
      top: 100px;
    }

    .wizard-actions {
      display: flex;
      align-items: center;
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid var(--border);

      .spacer { flex: 1; }
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 28px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 191, 234, 0.3);
      }
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--bg-main);
      color: var(--text-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--border);
        color: var(--text-primary);
      }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .wizard-split {
        grid-template-columns: 1fr;
      }
      .wizard-sidebar {
        position: static;
      }
    }

    @media (max-width: 640px) {
      .sell-car-page { padding: 20px 12px 60px; }
      .glass-panel { padding: 20px; }
      .step-label { display: none; }
    }
  `]
})
export class SellCarComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  step = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  lastSaved = signal<Date | null>(null);

  stepsList = [
    { label: 'Básico' },
    { label: 'Detalhes' },
    { label: 'Fotos' },
    { label: 'Preço & IA' },
    { label: 'Publicar' }
  ];

  carData = signal<CarDataDraft>({
    brand: '',
    customBrand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'SUV',
    fuelType: 'FLEX',
    transmission: 'AUTOMATIC',
    traction: '4x2',
    color: 'Branco',
    mileage: 0,
    seats: 5,
    doors: 4,
    images: [],
    imageUrl: '',
    pricePerDay: 180,
    salePrice: 0,
    city: 'São Paulo',
    state: 'SP',
    description: '',
    freeTestDrive: true,
    isNew: false
  });

  ngOnInit() {
    this.loadDraftFromLocalStorage();
  }

  onCarDataUpdate(updated: Partial<CarDataDraft>) {
    this.carData.update(current => ({ ...current, ...updated }));
    this.autoSaveDraft();
  }

  private autoSaveDraft() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    this.isSaving.set(true);
    try {
      localStorage.setItem('nexdrive_sell_car_draft', JSON.stringify(this.carData()));
      this.lastSaved.set(new Date());
    } catch (e) {
      console.warn('Draft auto-save warning', e);
    } finally {
      setTimeout(() => this.isSaving.set(false), 400);
    }
  }

  private loadDraftFromLocalStorage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem('nexdrive_sell_car_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.carData.set({ ...this.carData(), ...parsed });
          this.lastSaved.set(new Date());
          this.toast.info('Rascunho do anúncio recuperado automaticamente!');
        }
      }
    } catch (e) {
      console.warn('Could not restore draft', e);
    }
  }

  goToStep(target: number) {
    if (target < this.step() || this.validateStep(this.step())) {
      this.step.set(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextStep() {
    if (this.validateStep(this.step())) {
      if (this.step() < 5) {
        this.step.set(this.step() + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.set(this.step() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private validateStep(currentStep: number): boolean {
    const data = this.carData();

    if (currentStep === 1) {
      const brand = data.brand === 'OUTRA' ? data.customBrand : data.brand;
      if (!brand || !brand.trim()) {
        this.toast.error('Por favor, selecione ou digite a marca do veículo.');
        return false;
      }
      if (!data.model || !data.model.trim()) {
        this.toast.error('Por favor, informe o modelo do veículo.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!data.images || data.images.length === 0) {
        this.toast.warning('Adicionar ao menos 1 foto aumenta significativamente as chances de locação!');
      }
    } else if (currentStep === 4) {
      if (!data.pricePerDay || data.pricePerDay <= 0) {
        this.toast.error('Por favor, informe o valor da diária.');
        return false;
      }
      if (!data.city || !data.city.trim()) {
        this.toast.error('Por favor, informe a cidade do veículo.');
        return false;
      }
    }

    return true;
  }

  submitListing() {
    const data = this.carData();
    const finalBrand = data.brand === 'OUTRA' ? (data.customBrand || 'Outra') : data.brand;
    const primaryImage = (data.images && data.images.length > 0) ? data.images[0] : (data.imageUrl || '/assets/placeholder-car.svg');

    const galleryImages = (data.images || []).map((imgUrl, index) => ({
      position: index + 1,
      imageUrl: imgUrl
    }));

    const payload = {
      brand: finalBrand,
      model: data.model,
      year: data.year,
      category: data.category,
      fuelType: data.fuelType,
      transmission: data.transmission,
      color: data.color,
      mileage: data.mileage || 0,
      seats: data.seats || 5,
      doors: data.doors || 4,
      pricePerDay: data.pricePerDay,
      salePrice: data.salePrice || 0,
      city: data.city,
      state: data.state || 'SP',
      description: data.description,
      freeTestDrive: data.freeTestDrive,
      isNew: data.isNew,
      imageUrl: primaryImage,
      galleryImages: galleryImages
    };

    this.isSubmitting.set(true);

    this.http.post<any>('/api/vehicles/listing', payload).subscribe({
      next: (createdVehicle) => {
        this.isSubmitting.set(false);
        try { localStorage.removeItem('nexdrive_sell_car_draft'); } catch {}
        this.toast.success('🎉 Anúncio publicado com sucesso! Seu veículo já está disponível no catálogo.');
        this.router.navigate(['/car', createdVehicle.id || 1]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Create listing error', err);
        if (err?.status === 401) {
          this.toast.error('Você precisa estar logado para publicar um veículo.');
          this.router.navigate(['/login']);
        } else {
          this.toast.error('Erro ao publicar anúncio. Verifique os campos e tente novamente.');
        }
      }
    });
  }
}
