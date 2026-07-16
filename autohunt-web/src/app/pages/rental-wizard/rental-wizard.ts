import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../core/services/car';
import { Vehicle, Page } from '../../core/models/vehicle.model';
import { RentalService } from '../../core/services/rental';
import { ToastService } from '../../core/services/toast';
import { AuthService } from '../../core/services/auth';
import { LoadingComponent } from '../../components/loading/loading';

type kmOption = 'economy' | 'unlimited';
type protectionOption = 'padrao' | 'completo' | 'premium';

@Component({
  selector: 'app-rental-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent
  ],
  template: `
    <div class="wizard-container">
      <div class="wizard-card animate-in">
        
        <!-- HEADER WITH DYNAMIC WIZARD STEPS PROGRESS BAR -->
        <div class="wizard-header">
          <h1>Reserva de Veículo NexDrive</h1>
          
          <div class="steps-progress">
            <div class="step" [class.active]="step() === 1" [class.done]="step() > 1" (click)="goToStep(1)">
              <span *ngIf="step() <= 1">1</span>
              <svg *ngIf="step() > 1" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div class="step-label">Local & Data</div>
            </div>
            <div class="line" [class.done]="step() > 1"></div>
            
            <div class="step" [class.active]="step() === 2" [class.done]="step() > 2" (click)="goToStep(2)">
              <span *ngIf="step() <= 2">2</span>
              <svg *ngIf="step() > 2" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div class="step-label">Grupo</div>
            </div>
            <div class="line" [class.done]="step() > 2"></div>

            <div class="step" [class.active]="step() === 3" [class.done]="step() > 3" (click)="goToStep(3)">
              <span *ngIf="step() <= 3">3</span>
              <svg *ngIf="step() > 3" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div class="step-label">Proteções</div>
            </div>
            <div class="line" [class.done]="step() > 3"></div>

            <div class="step" [class.active]="step() === 4" [class.done]="step() > 4" (click)="goToStep(4)">
              <span *ngIf="step() <= 4">4</span>
              <svg *ngIf="step() > 4" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div class="step-label">Adicionais</div>
            </div>
            <div class="line" [class.done]="step() > 4"></div>

            <div class="step" [class.active]="step() === 5">
              <span>5</span>
              <div class="step-label">Confirmação</div>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════
             ETAPA 1: LOCAL, DATA E HORA
             ════════════════════════════════════════════════════════ -->
        <div class="step-content animate-fade" *ngIf="step() === 1">
          <!-- Non-blocking different-return warning banner -->
          <div class="warning-banner" *ngIf="pickup !== returnLoc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Você informou que a devolução do carro será realizada em uma agência diferente da de retirada. Poderá ser cobrado um valor adicional referente ao retorno do carro entre agências.</span>
          </div>

          <div class="step1-layout">
            <div class="fields-area">
              <!-- Pickup fields row -->
              <div class="inputs-row">
                <div class="input-field-container location-field">
                  <label>Onde você quer retirar o carro?</label>
                  <div class="input-with-icon">
                    <input type="text" [(ngModel)]="pickup" (focus)="showPickupSuggestions = true" (input)="filterPickupCities()" class="input-control" placeholder="Digite cidade ou agência...">
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div class="suggestions-dropdown" *ngIf="showPickupSuggestions && filteredPickupCities().length > 0">
                    <div class="suggestion-item" *ngFor="let city of filteredPickupCities()" (click)="selectPickup(city)">
                      {{ city }}
                    </div>
                  </div>
                </div>

                <div class="input-field-container date-field">
                  <label>Data</label>
                  <div class="input-with-icon">
                    <input type="date" [(ngModel)]="startDate" class="input-control">
                  </div>
                </div>

                <div class="input-field-container time-field">
                  <label>Hora</label>
                  <select [(ngModel)]="startTime" class="input-control select-control">
                    <option *ngFor="let t of timeSlots" [value]="t">{{ t }}</option>
                  </select>
                </div>
              </div>

              <!-- Return fields row -->
              <div class="inputs-row">
                <div class="input-field-container location-field">
                  <label>Digite o local de devolução</label>
                  <div class="input-with-icon">
                    <input type="text" [(ngModel)]="returnLoc" (focus)="showReturnSuggestions = true" (input)="filterReturnCities()" class="input-control" placeholder="Digite cidade ou agência...">
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div class="suggestions-dropdown" *ngIf="showReturnSuggestions && filteredReturnCities().length > 0">
                    <div class="suggestion-item" *ngFor="let city of filteredReturnCities()" (click)="selectReturn(city)">
                      {{ city }}
                    </div>
                  </div>
                </div>

                <div class="input-field-container date-field">
                  <label>Data</label>
                  <div class="input-with-icon">
                    <input type="date" [(ngModel)]="endDate" class="input-control">
                  </div>
                </div>

                <div class="input-field-container time-field">
                  <label>Hora</label>
                  <select [(ngModel)]="endTime" class="input-control select-control">
                    <option *ngFor="let t of timeSlots" [value]="t">{{ t }}</option>
                  </select>
                </div>
              </div>

              <!-- Promo code & Login suggestions row -->
              <div class="inputs-row bottom-row">
                <div class="input-field-container promo-field">
                  <div class="input-with-icon">
                    <input type="text" [(ngModel)]="promoCode" class="input-control" placeholder="Código promocional">
                    <svg class="field-icon gift" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8V4H8a2 2 0 0 1 0-4h4v4h4a2 2 0 0 1 0 4h-4zM5 12h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z"/></svg>
                  </div>
                </div>

                <div class="login-suggestion-banner" *ngIf="!isLoggedIn()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <div>
                    <span><strong>Faça login</strong> para conferir os benefícios adicionais para sua reserva!</span>
                    <a class="login-link" (click)="navigateToLogin()">Fazer Login</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-area">
              <button class="primary-action-btn" (click)="nextStep()">CONTINUAR</button>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════
             ETAPA 2: GRUPO DE VEÍCULOS (Se acessado genericamente)
             ════════════════════════════════════════════════════════ -->
        <div class="step-content animate-fade" *ngIf="step() === 2">
          <h2>Escolha o grupo de carros ideal para sua viagem</h2>
          
          <div class="vehicles-grid">
            <div class="vehicle-card" *ngFor="let vehicle of availableVehicles()">
              <div class="card-header-badge">Retirada Digital | NexDrive Premium</div>
              
              <div class="vehicle-title">
                <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
                <p>{{ translateCategory(vehicle.categoryName) }} · ou similar*</p>
              </div>

              <div class="vehicle-image-container">
                <img [src]="vehicle.imageUrl || '/assets/placeholder-car.svg'" [alt]="vehicle.brand + ' ' + vehicle.model">
              </div>

              <div class="vehicle-price-info">
                <div class="price-per-day-row">
                  <span class="label">A partir de</span>
                  <span class="value">R$ {{ vehicle.pricePerDay | number:'1.2-2':'pt-BR' }} <span>/dia</span></span>
                </div>
                <p class="estimated-total" *ngIf="daysCount() > 0">
                  R$ {{ (vehicle.pricePerDay * daysCount()) | number:'1.2-2':'pt-BR' }} /Total por {{ daysCount() }} dias
                </p>
              </div>

              <button class="select-group-btn" (click)="selectVehicle(vehicle)">ESCOLHER GRUPO</button>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════
             ETAPA 3: FRANQUIA DE KM E PACOTES DE PROTEÇÃO
             ════════════════════════════════════════════════════════ -->
        <div class="step-content animate-fade two-column-layout" *ngIf="step() === 3">
          <div class="main-options-column">
            <h2>Agora, na NexDrive, o preço é do tamanho da sua viagem!</h2>

            <!-- Mileage selections -->
            <div class="mileage-options-grid">
              <div class="mileage-option-card" [class.selected]="kmLimit === 'economy'" (click)="kmLimit = 'economy'">
                <div class="radio-header">
                  <span class="radio-circle"></span>
                  <div>
                    <h3>Quilometragem econômica</h3>
                    <p>1600 km disponíveis para você distribuir como quiser durante sua locação.</p>
                  </div>
                </div>
                <div class="mileage-price-block">
                  <span class="economy-tag">5% de economia</span>
                  <div class="price">R$ {{ (car()?.pricePerDay || 0) * 0.95 | number:'1.2-2':'pt-BR' }}<span>/dia</span></div>
                  <p class="extra-km">+ R$0,50 por quilômetro excedente</p>
                </div>
              </div>

              <div class="mileage-option-card" [class.selected]="kmLimit === 'unlimited'" (click)="kmLimit = 'unlimited'">
                <div class="radio-header">
                  <span class="radio-circle"></span>
                  <div>
                    <h3>Quilometragem ilimitada</h3>
                    <p>Tranquilidade total para rodar o quanto quiser.</p>
                  </div>
                </div>
                <div class="mileage-price-block">
                  <div class="price">R$ {{ car()?.pricePerDay || 0 | number:'1.2-2':'pt-BR' }}<span>/dia</span></div>
                  <p class="extra-km">Sem cobrança por quilômetro excedente</p>
                </div>
              </div>
            </div>

            <!-- Protections selector -->
            <h2>Pacotes de proteções e adicionais</h2>
            <p class="section-sub">Selecione um pacote de proteção abaixo e economize.</p>

            <div class="protection-packages-grid">
              <!-- Padrão -->
              <div class="protection-package-card" [class.selected]="protectionPackage === 'padrao'" (click)="protectionPackage = 'padrao'">
                <div class="package-header">
                  <h3>Padrão</h3>
                </div>
                <ul class="package-features">
                  <li class="included">Parcele em até 3x sem juros</li>
                  <li class="included">Cobertura parcial para avarias</li>
                  <li class="included">Cobertura para terceiros</li>
                  <li class="not-included">Cobertura para vidros e pneus</li>
                  <li class="not-included">Compensação de CO2</li>
                  <li class="not-included">Condutor adicional incluso</li>
                </ul>
                <div class="package-price-footer">
                  <span class="discount-tag">10% de desconto</span>
                  <div class="prices">
                    <span class="old-price">R$ 39,90</span>
                    <span class="current-price">R$ 35,55/dia</span>
                  </div>
                  <button class="package-select-btn" [class.active]="protectionPackage === 'padrao'">
                    {{ protectionPackage === 'padrao' ? 'Selecionado' : 'Selecionar' }}
                  </button>
                </div>
              </div>

              <!-- Completo -->
              <div class="protection-package-card recommended" [class.selected]="protectionPackage === 'completo'" (click)="protectionPackage = 'completo'">
                <div class="recommended-badge">Recomendado</div>
                <div class="package-header">
                  <h3>Completo</h3>
                </div>
                <ul class="package-features">
                  <li class="included text-green">Parcele em até 4x sem juros</li>
                  <li class="included text-green">Cobertura total para avarias</li>
                  <li class="included text-green">Cobertura total para terceiros</li>
                  <li class="included text-green">Cobertura para vidros e pneus</li>
                  <li class="included text-green">Compensação de CO2</li>
                  <li class="not-included">Condutor adicional incluso</li>
                </ul>
                <div class="package-price-footer">
                  <span class="discount-tag green">20% de desconto</span>
                  <div class="prices">
                    <span class="old-price">R$ 81,84</span>
                    <span class="current-price">R$ 65,19/dia</span>
                  </div>
                  <button class="package-select-btn green-btn" [class.active]="protectionPackage === 'completo'">
                    {{ protectionPackage === 'completo' ? 'Selecionado' : 'Selecionar' }}
                  </button>
                </div>
              </div>

              <!-- Premium -->
              <div class="protection-package-card" [class.selected]="protectionPackage === 'premium'" (click)="protectionPackage = 'premium'">
                <div class="package-header">
                  <h3>Premium</h3>
                </div>
                <ul class="package-features">
                  <li class="included">Parcele em até 6x sem juros</li>
                  <li class="included">Cobertura total para avarias</li>
                  <li class="included">Cobertura total para terceiros</li>
                  <li class="included">Cobertura para vidros e pneus</li>
                  <li class="included">Compensação de CO2</li>
                  <li class="included">Condutor adicional incluso</li>
                </ul>
                <div class="package-price-footer">
                  <span class="discount-tag">49% de desconto</span>
                  <div class="prices">
                    <span class="old-price">R$ 148,98</span>
                    <span class="current-price">R$ 75,16/dia</span>
                  </div>
                  <button class="package-select-btn" [class.active]="protectionPackage === 'premium'">
                    {{ protectionPackage === 'premium' ? 'Selecionado' : 'Selecionar' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="step-nav-buttons">
              <button class="nav-back-btn" (click)="prevStep()">VOLTAR</button>
              <button class="nav-continue-btn" (click)="nextStep()">CONTINUAR</button>
            </div>
          </div>

          <!-- Sticky Summary Panel -->
          <ng-container *ngTemplateOutlet="summaryPanelTpl"></ng-container>
        </div>

        <!-- ════════════════════════════════════════════════════════
             ETAPA 4: ADICIONAIS E ITENS OPCIONAIS
             ════════════════════════════════════════════════════════ -->
        <div class="step-content animate-fade two-column-layout" *ngIf="step() === 4">
          <div class="main-options-column">
            <h2>Proteções opcionais adicionais</h2>
            <p class="section-sub">Escolha proteções extras para deixar seu aluguel ainda mais tranquilo: (opcional)</p>

            <div class="additional-options-list">
              <!-- Add Driver -->
              <div class="additional-option-row">
                <div class="option-info">
                  <h3>Condutor Adicional Ilimitado</h3>
                  <p>Vai precisar que outros motoristas dirijam o carro? Habilite condutores adicionais em seu contrato de aluguel para dirigir legalmente.</p>
                </div>
                <div class="option-action">
                  <span class="price">R$ 21,95 /dia</span>
                  <input type="checkbox" [(ngModel)]="addDriver" class="checkbox-control">
                </div>
              </div>

              <!-- Young Driver -->
              <div class="additional-option-row">
                <div class="option-info">
                  <h3>Condutor Jovem</h3>
                  <p>Adicione caso o condutor principal ou secundário tenha idade entre 18 e 21 anos.</p>
                </div>
                <div class="option-action">
                  <span class="price">R$ 38,95 /dia</span>
                  <input type="checkbox" [(ngModel)]="youngDriver" class="checkbox-control">
                </div>
              </div>
            </div>

            <h2>Itens opcionais e Acessórios</h2>
            <p class="section-sub">Adicione itens para sua comodidade (sujeitos a disponibilidade local)</p>

            <div class="accessories-grid">
              <div class="accessory-card">
                <div class="icon-title">
                  <span class="icon">👶</span>
                  <div>
                    <h3>Assento de elevação</h3>
                    <p>R$ 34,95/dia (unidade)</p>
                  </div>
                </div>
                <div class="qty-selector">
                  <button (click)="decrementQty('assento')">-</button>
                  <span>{{ qtyAssento }}</span>
                  <button (click)="incrementQty('assento')">+</button>
                </div>
              </div>

              <div class="accessory-card">
                <div class="icon-title">
                  <span class="icon">🍼</span>
                  <div>
                    <h3>Bebê conforto</h3>
                    <p>R$ 34,95/dia (unidade)</p>
                  </div>
                </div>
                <div class="qty-selector">
                  <button (click)="decrementQty('conforto')">-</button>
                  <span>{{ qtyConforto }}</span>
                  <button (click)="incrementQty('conforto')">+</button>
                </div>
              </div>

              <div class="accessory-card">
                <div class="icon-title">
                  <span class="icon">🧸</span>
                  <div>
                    <h3>Cadeira de bebê</h3>
                    <p>R$ 34,95/dia (unidade)</p>
                  </div>
                </div>
                <div class="qty-selector">
                  <button (click)="decrementQty('cadeira')">-</button>
                  <span>{{ qtyCadeira }}</span>
                  <button (click)="incrementQty('cadeira')">+</button>
                </div>
              </div>
            </div>

            <div class="step-nav-buttons">
              <button class="nav-back-btn" (click)="prevStep()">VOLTAR</button>
              <button class="nav-continue-btn" (click)="nextStep()">CONTINUAR</button>
            </div>
          </div>

          <!-- Sticky Summary Panel -->
          <ng-container *ngTemplateOutlet="summaryPanelTpl"></ng-container>
        </div>

        <!-- ════════════════════════════════════════════════════════
             ETAPA 5: CONFIRMAÇÃO DA RESERVA (FINAL)
             ════════════════════════════════════════════════════════ -->
        <div class="step-content animate-fade final-confirmation-step" *ngIf="step() === 5">
          <h2>Revise e Confirme sua Reserva</h2>
          <p class="confirmation-sub">Verifique as informações abaixo. Para confirmar e realizar o bloqueio do veículo, clique no botão de finalizar.</p>

          <div class="confirmation-grid">
            <!-- Review breakdown box -->
            <div class="summary-details-box">
              <h3>Resumo do Veículo e Período</h3>
              
              <div class="info-row">
                <span>Veículo:</span>
                <strong>{{ car()?.brand }} {{ car()?.model }}</strong>
              </div>
              
              <div class="info-row">
                <span>Período:</span>
                <strong>{{ startDate }} {{ startTime }} até {{ endDate }} {{ endTime }} ({{ daysCount() }} diárias)</strong>
              </div>
              
              <div class="info-row">
                <span>Retirada:</span>
                <strong>{{ pickup }}</strong>
              </div>
              
              <div class="info-row">
                <span>Devolução:</span>
                <strong>{{ returnLoc }}</strong>
              </div>

              <div class="divider"></div>

              <h3>Configurações Adicionais</h3>
              
              <div class="info-row">
                <span>Quilometragem:</span>
                <strong>{{ kmLimit === 'economy' ? 'Econômica (1600 km)' : 'Ilimitada' }}</strong>
              </div>
              
              <div class="info-row">
                <span>Proteção contratada:</span>
                <strong>Pacote {{ protectionPackage | titlecase }}</strong>
              </div>

              <div class="info-row" *ngIf="addDriver">
                <span>Condutor Adicional:</span>
                <strong>Sim (Incluso)</strong>
              </div>

              <div class="info-row" *ngIf="youngDriver">
                <span>Condutor Jovem:</span>
                <strong>Sim (Incluso)</strong>
              </div>

              <div class="info-row" *ngIf="qtyAssento > 0 || qtyConforto > 0 || qtyCadeira > 0">
                <span>Acessórios:</span>
                <strong>
                  {{ qtyAssento > 0 ? qtyAssento + 'x Assento de Elevação ' : '' }}
                  {{ qtyConforto > 0 ? qtyConforto + 'x Bebê Conforto ' : '' }}
                  {{ qtyCadeira > 0 ? qtyCadeira + 'x Cadeira de Bebê ' : '' }}
                </strong>
              </div>
            </div>

            <!-- Price Breakdown & Confirm block -->
            <div class="final-price-submit-card">
              <div class="price-header">
                <span class="label">Total Geral Estimado</span>
                <div class="price-value">
                  <span class="currency">R$</span>
                  <span class="amount">{{ calculation().grandTotal | number:'1.2-2':'pt-BR' }}</span>
                </div>
                <p class="subtext">taxas e encargos inclusos</p>
              </div>

              <div class="user-info-confirmation" *ngIf="currentUser()">
                <p>Reserva registrada para:</p>
                <strong>{{ currentUser()?.fullName }}</strong>
                <span class="user-email">{{ currentUser()?.email }}</span>
              </div>

              <div class="confirmation-actions">
                <button class="nav-back-btn" (click)="prevStep()">VOLTAR</button>
                <button class="confirm-booking-btn" (click)="confirmBooking()" [disabled]="isSubmitting()">
                  {{ isSubmitting() ? 'PROCESSANDO...' : 'FINALIZAR RESERVA' }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Sticky Summary Sidebar Template -->
    <ng-template #summaryPanelTpl>
      <div class="sticky-summary-panel">
        <div class="summary-card-inner">
          <div class="group-header">
            <div>
              <h4>Grupo Escolhido</h4>
              <p class="group-name">{{ car()?.brand }} {{ car()?.model }}</p>
            </div>
            <a class="edit-link" (click)="goToStep(2)" *ngIf="!isPreselectedCar">Editar</a>
          </div>

          <div class="offer-details">
            <h5>Resumo da Fatura</h5>
            
            <div class="detail-row">
              <span>Diárias ({{ daysCount() }} x R$ {{ (kmLimit === 'economy' ? (car()?.pricePerDay || 0) * 0.95 : (car()?.pricePerDay || 0)) | number:'1.2-2':'pt-BR' }})</span>
              <strong>R$ {{ calculation().diariasTotal | number:'1.2-2':'pt-BR' }}</strong>
            </div>

            <div class="detail-row" *ngIf="kmLimit === 'economy'">
              <span>Franquia de Km ({{ daysCount() }} x R$ 10,95)</span>
              <strong>R$ {{ calculation().kmFranquiaTotal | number:'1.2-2':'pt-BR' }}</strong>
            </div>

            <div class="detail-row package-discount-row">
              <span>Proteção {{ protectionPackage | titlecase }}</span>
              <div class="disc-details">
                <span class="badge-discount">{{ calculation().protecaoDesconto }}%</span>
                <span class="old-price-line">R$ {{ calculation().protecaoOriginalTotal | number:'1.2-2':'pt-BR' }}</span>
                <strong>R$ {{ calculation().protecaoTotal | number:'1.2-2':'pt-BR' }}</strong>
              </div>
            </div>

            <div class="summary-add-ons" *ngIf="calculation().hasAddons">
              <h6>Adicionais e Acessórios:</h6>
              <div class="addon-detail-row" *ngIf="addDriver">
                <span>Condutor Adicional ({{ daysCount() }} x R$ 21,95)</span>
                <strong>R$ {{ (21.95 * daysCount()) | number:'1.2-2':'pt-BR' }}</strong>
              </div>
              <div class="addon-detail-row" *ngIf="youngDriver">
                <span>Condutor Jovem ({{ daysCount() }} x R$ 38,95)</span>
                <strong>R$ {{ (38.95 * daysCount()) | number:'1.2-2':'pt-BR' }}</strong>
              </div>
              <div class="addon-detail-row" *ngIf="qtyAssento > 0">
                <span>Assento de Elevação ({{ qtyAssento }} x {{ daysCount() }} x R$ 34,95)</span>
                <strong>R$ {{ (34.95 * qtyAssento * daysCount()) | number:'1.2-2':'pt-BR' }}</strong>
              </div>
              <div class="addon-detail-row" *ngIf="qtyConforto > 0">
                <span>Bebê Conforto ({{ qtyConforto }} x {{ daysCount() }} x R$ 34,95)</span>
                <strong>R$ {{ (34.95 * qtyConforto * daysCount()) | number:'1.2-2':'pt-BR' }}</strong>
              </div>
              <div class="addon-detail-row" *ngIf="qtyCadeira > 0">
                <span>Cadeira de Bebê ({{ qtyCadeira }} x {{ daysCount() }} x R$ 34,95)</span>
                <strong>R$ {{ (34.95 * qtyCadeira * daysCount()) | number:'1.2-2':'pt-BR' }}</strong>
              </div>
            </div>

            <div class="detail-row" *ngIf="calculation().returnFee > 0">
              <span>Taxa de Retorno (Agência Diferente)</span>
              <strong>R$ {{ calculation().returnFee | number:'1.2-2':'pt-BR' }}</strong>
            </div>

            <div class="detail-row">
              <span>Taxa de Aluguel (15.00%)</span>
              <strong>R$ {{ calculation().rentalTax | number:'1.2-2':'pt-BR' }}</strong>
            </div>
          </div>

          <div class="grand-total-block">
            <span class="title">Valor total previsto</span>
            <div class="price-value">
              <span class="currency">R$</span>
              <span class="amount">{{ calculation().grandTotal | number:'1.2-2':'pt-BR' }}</span>
            </div>
            <p class="installments">Em até 12x de R$ {{ (calculation().grandTotal / 12) | number:'1.2-2':'pt-BR' }} sem juros*</p>
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #loadingTpl>
      <app-loading></app-loading>
    </ng-template>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════════════
       WIZARD STYLING (Premium Azul Noturno + Ciano Elétrico)
       ═══════════════════════════════════════════════════════════════ */
    .wizard-container {
      max-width: var(--max-width);
      margin: 40px auto;
      padding: 0 24px;
    }

    .wizard-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 40px;
      box-shadow: var(--shadow-lg);
      transition: all 0.3s ease;
    }

    .wizard-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
      
      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 26px;
        font-weight: 800;
        margin-bottom: 28px;
        color: var(--text-primary);
        text-align: center;
      }
    }

    /* Steps Progress Bar Styling */
    .steps-progress {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 780px;
      position: relative;
      margin-bottom: 20px;
      
      .step {
        width: 38px;
        height: 38px;
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
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        cursor: pointer;
        position: relative;

        .step-label {
          position: absolute;
          top: 46px;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: white;
        }
        
        &.active {
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 800;
          box-shadow: 0 0 14px var(--accent-light);
          .step-label {
            color: var(--accent);
            font-weight: 700;
          }
        }
        &.done {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--text-inverse);
          .step-label {
            color: var(--text-primary);
          }
        }
      }
      
      .line {
        flex: 1;
        height: 3px;
        background: var(--border);
        transition: background-color 0.3s ease;
        margin: 0 12px;
        &.done {
          background: var(--accent);
        }
      }
    }

    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--text-primary);
      text-align: left;
    }

    .section-sub {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      text-align: left;
    }

    /* ═══════════════════════════════════════════════
       ETAPA 1: LOCAL E DATAS
    ═══════════════════════════════════════════════ */
    .warning-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: rgba(245, 158, 11, 0.08);
      border: 1.5px solid var(--warning);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
      text-align: left;
      margin-bottom: 28px;
      animation: panelIn 0.25s ease-out;

      svg {
        color: var(--warning);
        flex-shrink: 0;
      }
    }

    .step1-layout {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 28px;
      align-items: flex-end;
    }

    .fields-area {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .inputs-row {
      display: grid;
      grid-template-columns: 1.8fr 1fr 1fr;
      gap: 16px;
    }

    .bottom-row {
      grid-template-columns: 1.8fr 2fr;
      align-items: center;
    }

    .input-field-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      text-align: left;

      label {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
      }
    }

    .input-with-icon {
      position: relative;
      width: 100%;
    }

    .input-control {
      width: 100%;
      padding: 14px 16px;
      padding-right: 42px;
      background: var(--surface-secondary);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      outline: none;
      transition: all 0.25s ease;

      &:focus {
        border-color: var(--accent);
        background: var(--surface);
        box-shadow: 0 0 0 3px var(--accent-light);
      }
    }

    .select-control {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23536471' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 15px;
      padding-right: 40px;
    }

    .field-icon {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
      &.gift {
        color: var(--success);
      }
    }

    /* Autocomplete suggestions dropdown */
    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 50;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 4px;
    }

    .suggestion-item {
      padding: 12px 16px;
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
      transition: background 0.15s;
      
      &:hover {
        background: var(--surface-secondary);
        color: var(--accent);
      }
    }

    .login-suggestion-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: var(--accent-light);
      border: 1px dashed var(--accent);
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      color: var(--text-primary);
      text-align: left;

      svg {
        color: var(--accent);
        flex-shrink: 0;
      }
      
      .login-link {
        color: var(--accent);
        font-weight: 700;
        text-decoration: underline;
        margin-left: 6px;
        cursor: pointer;
      }
    }

    .action-area {
      width: 100%;
    }

    .primary-action-btn {
      width: 100%;
      padding: 16px 24px;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-accent);

      &:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
      }
    }

    /* ═══════════════════════════════════════════════
       ETAPA 2: VEHICLE GRID
    ═══════════════════════════════════════════════ */
    .vehicles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 28px;
    }

    .vehicle-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      text-align: left;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s ease;

      &:hover {
        border-color: var(--accent);
        box-shadow: var(--shadow-md);
      }

      .card-header-badge {
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 12px;
      }

      .vehicle-title {
        h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }
        p {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
        }
      }

      .vehicle-image-container {
        height: 140px;
        margin: 16px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s;
        }
      }

      &:hover .vehicle-image-container img {
        transform: scale(1.05);
      }

      .vehicle-price-info {
        margin-top: auto;
        padding-top: 14px;
        border-top: 1px solid var(--border-light);

        .price-per-day-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;

          .label {
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 600;
          }
          .value {
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            font-weight: 800;
            color: var(--accent);

            span {
              font-size: 12px;
              color: var(--text-muted);
              font-weight: 600;
            }
          }
        }

        .estimated-total {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--success);
          margin-top: 4px;
        }

        .tax-info {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 6px;
          line-height: 1.4;
        }
      }

      .select-group-btn {
        width: 100%;
        margin-top: 16px;
        padding: 12px;
        background: var(--surface-secondary);
        color: var(--text-primary);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;

        &:hover {
          background: var(--accent);
          color: var(--text-inverse);
          border-color: var(--accent);
        }
      }
    }

    /* ═══════════════════════════════════════════════
       TWO COLUMN LAYOUT FOR STEPS 3 & 4
    ═══════════════════════════════════════════════ */
    .two-column-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 32px;
      align-items: start;
    }

    .main-options-column {
      min-width: 0;
    }

    /* Mileage cards styling */
    .mileage-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 24px 0 36px;
    }

    .mileage-option-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      background: var(--surface);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: left;
      transition: all 0.2s;

      &:hover {
        border-color: var(--text-muted);
      }

      &.selected {
        border-color: var(--accent);
        background: var(--accent-light);
        
        .radio-circle::after {
          opacity: 1;
        }
      }

      .radio-header {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }
        p {
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }
      }

      .radio-circle {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid var(--border);
        position: relative;
        flex-shrink: 0;
        margin-top: 2px;
        background: var(--surface);

        &::after {
          content: '';
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.15s;
        }
      }

      .mileage-price-block {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .economy-tag {
          align-self: flex-start;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .price {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);

          span {
            font-size: 13px;
            color: var(--text-muted);
          }
        }

        .extra-km {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: var(--text-muted);
        }
      }
    }

    /* Protection package cards styling */
    .protection-packages-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }

    .protection-package-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      display: flex;
      flex-direction: column;
      padding: 24px;
      position: relative;
      text-align: left;
      cursor: pointer;
      transition: all 0.25s ease;

      &:hover {
        border-color: var(--text-secondary);
      }

      &.selected {
        border-color: var(--accent);
        box-shadow: 0 0 16px var(--accent-light);
      }

      &.recommended {
        border-color: var(--success);
        background: rgba(16, 185, 129, 0.02);

        &.selected {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
        }
      }

      .recommended-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success);
        color: white;
        padding: 4px 14px;
        border-radius: var(--radius-full);
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .package-header {
        margin-bottom: 18px;
        h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }
      }

      .package-features {
        list-style: none;
        padding: 0;
        margin: 0 0 24px 0;
        display: flex;
        flex-direction: column;
        gap: 10px;

        li {
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          line-height: 1.4;
          padding-left: 20px;
          position: relative;

          &::before {
            position: absolute;
            left: 0;
            top: 2px;
            font-weight: 700;
          }

          &.included {
            color: var(--text-primary);
            &::before {
              content: '✓';
              color: var(--success);
            }
          }
          &.not-included {
            color: var(--text-muted);
            text-decoration: line-through;
            &::before {
              content: '✕';
              color: var(--error);
            }
          }
          &.text-green {
            font-weight: 600;
          }
        }
      }

      .package-price-footer {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .discount-tag {
          align-self: flex-start;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          background: var(--border);
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;

          &.green {
            background: rgba(16, 185, 129, 0.15);
            color: var(--success);
          }
        }

        .prices {
          display: flex;
          flex-direction: column;
          
          .old-price {
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            color: var(--text-muted);
            text-decoration: line-through;
          }
          .current-price {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            font-weight: 800;
            color: var(--text-primary);
          }
        }
      }

      .package-select-btn {
        width: 100%;
        padding: 10px;
        background: transparent;
        color: var(--accent);
        border: 1.5px solid var(--accent);
        border-radius: var(--radius-md);
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
          background: var(--accent);
          color: var(--text-inverse);
        }

        &.green-btn {
          color: var(--success);
          border-color: var(--success);

          &.active {
            background: var(--success);
            color: white;
          }
        }
      }
    }

    /* ═══════════════════════════════════════════════
       ETAPA 4: ADICIONAIS & ACESSÓRIOS
    ═══════════════════════════════════════════════ */
    .additional-options-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 20px 0 36px;
    }

    .additional-option-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      padding: 20px 24px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      text-align: left;

      .option-info {
        flex: 1;
        
        h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
        }
        p {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.5;
        }
      }

      .option-action {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        flex-shrink: 0;

        .price {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
        }

        .checkbox-control {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }
    }

    .accessories-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 20px 0 40px;
    }

    .accessory-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      background: var(--surface);
      display: flex;
      flex-direction: column;
      gap: 18px;
      text-align: left;

      .icon-title {
        display: flex;
        gap: 12px;
        align-items: center;

        .icon {
          font-size: 24px;
        }
        h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
        }
        p {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
      }

      .qty-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: auto;

        button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--surface-secondary);
          color: var(--text-primary);
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;

          &:hover {
            border-color: var(--accent);
            color: var(--accent);
          }
        }

        span {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }
      }
    }

    /* Buttons navigation inside pages */
    .step-nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
    }

    .nav-back-btn {
      padding: 14px 28px;
      background: var(--surface-secondary);
      color: var(--text-secondary);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--border);
        color: var(--text-primary);
      }
    }

    .nav-continue-btn {
      padding: 14px 36px;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-accent);

      &:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
      }
    }

    /* ═══════════════════════════════════════════════
       STICKY SUMMARY SIDEBAR (Mirrors Localiza)
    ═══════════════════════════════════════════════ */
    .sticky-summary-panel {
      position: sticky;
      top: 100px;
      z-index: 10;
    }

    .summary-card-inner {
      background: var(--surface-secondary);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: left;
      box-shadow: var(--shadow-md);

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 14px;
        border-bottom: 1.5px solid var(--border);

        h4 {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .group-name {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 2px;
        }
        .edit-link {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--accent);
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }
      }

      .offer-details {
        display: flex;
        flex-direction: column;
        gap: 12px;

        h5 {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
          
          span {
            font-weight: 500;
          }
          strong {
            color: var(--text-primary);
            font-weight: 700;
          }
        }

        .package-discount-row {
          align-items: flex-start;
          
          .disc-details {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;

            .badge-discount {
              padding: 1px 6px;
              border-radius: var(--radius-xs);
              background: rgba(16, 185, 129, 0.15);
              color: var(--success);
              font-size: 9px;
              font-weight: 800;
            }
            .old-price-line {
              font-size: 10px;
              color: var(--text-muted);
              text-decoration: line-through;
            }
          }
        }

        /* Add-ons list inside the summary */
        .summary-add-ons {
          margin-top: 6px;
          padding: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;

          h6 {
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
          }

          .addon-detail-row {
            display: flex;
            justify-content: space-between;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            color: var(--text-secondary);
            
            strong {
              color: var(--text-primary);
              font-weight: 600;
            }
          }
        }
      }

      .grand-total-block {
        margin-top: 8px;
        padding-top: 16px;
        border-top: 1.5px dashed var(--border);
        display: flex;
        flex-direction: column;
        align-items: center;

        .title {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .price-value {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin: 6px 0;

          .currency {
            font-size: 16px;
            font-weight: 800;
            color: var(--accent);
          }
          .amount {
            font-family: 'Outfit', sans-serif;
            font-size: 28px;
            font-weight: 800;
            color: var(--accent);
            line-height: 1;
          }
        }

        .installments {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          color: var(--text-muted);
        }
      }
    }

    /* ═══════════════════════════════════════════════
       ETAPA 5: CONFIRMAÇÃO E AUTENTICAÇÃO
    ═══════════════════════════════════════════════ */
    .final-confirmation-step {
      text-align: left;
    }

    .confirmation-sub {
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-bottom: 28px;
    }

    .confirmation-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 32px;
      align-items: start;
    }

    .summary-details-box {
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      background: var(--surface);
      display: flex;
      flex-direction: column;
      gap: 16px;

      h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        
        span {
          color: var(--text-secondary);
          font-weight: 500;
        }
        strong {
          color: var(--text-primary);
          font-weight: 700;
        }
      }
    }

    .final-price-submit-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      background: var(--surface-secondary);
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: center;

      .price-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .label {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .price-value {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin: 6px 0;

          .currency {
            font-size: 18px;
            font-weight: 800;
            color: var(--accent);
          }
          .amount {
            font-family: 'Outfit', sans-serif;
            font-size: 32px;
            font-weight: 800;
            color: var(--accent);
            line-height: 1;
          }
        }

        .subtext {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: var(--text-muted);
        }
      }

      .user-info-confirmation {
        padding: 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 2px;

        p {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }
        strong {
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .user-email {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
        }
      }

      .confirmation-actions {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-top: 8px;

        .nav-back-btn {
          flex: 1;
        }
        
        .confirm-booking-btn {
          flex: 1.8;
          padding: 14px;
          background: var(--success);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
          transition: all 0.2s;

          &:hover:not(:disabled) {
            background: #0f9d6c;
            transform: translateY(-1px);
          }
          &:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }
        }
      }
    }

    /* ── Utilities & animations ── */
    .animate-in {
      animation: wizardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes wizardIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade {
      animation: fadeIn 0.28s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .divider {
      height: 1.5px;
      background: var(--border);
      margin: 8px 0;
    }

    /* Responsive media queries */
    @media (max-width: 992px) {
      .two-column-layout {
        grid-template-columns: 1fr;
      }
      .sticky-summary-panel {
        position: static;
        margin-top: 24px;
      }
      .step1-layout {
        grid-template-columns: 1fr;
      }
      .action-area {
        margin-top: 8px;
      }
    }

    @media (max-width: 768px) {
      .wizard-card {
        padding: 24px 16px;
      }
      .inputs-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .bottom-row {
        grid-template-columns: 1fr;
      }
      .mileage-options-grid {
        grid-template-columns: 1fr;
      }
      .protection-packages-grid {
        grid-template-columns: 1fr;
      }
      .accessories-grid {
        grid-template-columns: 1fr;
      }
      .confirmation-grid {
        grid-template-columns: 1fr;
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
  availableVehicles = signal<Vehicle[]>([]);
  step = signal(1);
  isSubmitting = signal(false);
  isPreselectedCar = false;

  // ── Form choices ──
  startDate = '';
  endDate = '';
  startTime = '12:00';
  endTime = '12:00';
  pickup = 'São Paulo, SP';
  returnLoc = 'São Paulo, SP';
  promoCode = '';

  // Autocomplete suggestions signals
  showPickupSuggestions = false;
  showReturnSuggestions = false;
  filteredPickupCities = signal<string[]>([]);
  filteredReturnCities = signal<string[]>([]);

  // Step 3 options
  kmLimit: kmOption = 'unlimited';
  protectionPackage: protectionOption = 'completo';

  // Step 4 options
  addDriver = false;
  youngDriver = false;
  qtyAssento = 0;
  qtyConforto = 0;
  qtyCadeira = 0;

  cities = [
    'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
    'Curitiba, PR', 'Porto Alegre, RS', 'Brasília, DF',
    'Salvador, BA', 'Recife, PE', 'Fortaleza, CE'
  ];

  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  currentUser = computed(() => this.authService.currentUser());
  isLoggedIn = computed(() => this.authService.isLoggedIn());

  daysCount = computed(() => {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  // Reactive computed total calculator
  calculation = computed(() => {
    const days = this.daysCount();
    const c = this.car();
    if (!c || days <= 0) {
      return {
        diariasTotal: 0,
        kmFranquiaTotal: 0,
        protecaoOriginalTotal: 0,
        protecaoTotal: 0,
        protecaoDesconto: 0,
        addonsTotal: 0,
        returnFee: 0,
        rentalTax: 0,
        grandTotal: 0,
        hasAddons: false
      };
    }

    // 1. Daily rate base
    let dailyRate = c.pricePerDay;
    let kmFranquiaTotal = 0;
    if (this.kmLimit === 'economy') {
      dailyRate = c.pricePerDay * 0.95; // 5% off daily rate
      kmFranquiaTotal = 10.95 * days;
    }
    const diariasTotal = dailyRate * days;

    // 2. Protection Package
    let protecaoOriginal = 0;
    let protecaoDesconto = 0; // percent
    if (this.protectionPackage === 'padrao') {
      protecaoOriginal = 39.90;
      protecaoDesconto = 10;
    } else if (this.protectionPackage === 'completo') {
      protecaoOriginal = 81.84;
      protecaoDesconto = 20;
    } else if (this.protectionPackage === 'premium') {
      protecaoOriginal = 148.98;
      protecaoDesconto = 49;
    }
    const protecaoOriginalTotal = protecaoOriginal * days;
    const protecaoTotal = (protecaoOriginal * (1 - protecaoDesconto / 100)) * days;

    // 3. Addons & Accessories
    let addonsTotal = 0;
    if (this.addDriver) {
      addonsTotal += 21.95 * days;
    }
    if (this.youngDriver) {
      addonsTotal += 38.95 * days;
    }
    
    // Accessories
    addonsTotal += 34.95 * this.qtyAssento * days;
    addonsTotal += 34.95 * this.qtyConforto * days;
    addonsTotal += 34.95 * this.qtyCadeira * days;

    // 4. Return Fee (if locations differ)
    const returnFee = this.pickup !== this.returnLoc ? 150.00 : 0.00;

    // 5. Subtotal and Tax
    const subtotal = diariasTotal + kmFranquiaTotal + protecaoTotal + addonsTotal;
    const rentalTax = (subtotal + returnFee) * 0.15; // 15% tax

    const grandTotal = subtotal + returnFee + rentalTax;

    return {
      diariasTotal,
      kmFranquiaTotal,
      protecaoOriginalTotal,
      protecaoTotal,
      protecaoDesconto,
      addonsTotal,
      returnFee,
      rentalTax,
      grandTotal,
      hasAddons: this.addDriver || this.youngDriver || this.qtyAssento > 0 || this.qtyConforto > 0 || this.qtyCadeira > 0
    };
  });

  ngOnInit() {
    this.filteredPickupCities.set(this.cities);
    this.filteredReturnCities.set(this.cities);

    // 1. Check for pending saved state (returning from login)
    const savedState = sessionStorage.getItem('pending_rental_wizard_state');
    if (savedState) {
      sessionStorage.removeItem('pending_rental_wizard_state');
      try {
        const state = JSON.parse(savedState);
        this.startDate = state.startDate;
        this.endDate = state.endDate;
        this.startTime = state.startTime;
        this.endTime = state.endTime;
        this.pickup = state.pickup;
        this.returnLoc = state.returnLoc;
        this.promoCode = state.promoCode;
        this.kmLimit = state.kmLimit;
        this.protectionPackage = state.protectionPackage;
        this.addDriver = state.addDriver;
        this.youngDriver = state.youngDriver;
        this.qtyAssento = state.qtyAssento;
        this.qtyConforto = state.qtyConforto;
        this.qtyCadeira = state.qtyCadeira;
        
        if (state.car) {
          this.car.set(state.car);
        }
        // Jump straight to step 5 (Confirmation) since the wizard is completed
        this.step.set(5);
      } catch (e) {
        console.error('Erro ao restaurar estado pendente:', e);
      }
    }

    // 2. Fetch car details by route param
    this.route.params.subscribe((params: any) => {
      const id = +params['id'];
      if (id && id > 0) {
        this.carService.getById(id).subscribe((car: Vehicle) => {
          this.car.set(car);
          if (!savedState) {
            this.pickup = car.city + ', ' + car.state;
            this.returnLoc = this.pickup;
          }
          this.isPreselectedCar = true;
        });
      } else {
        this.isPreselectedCar = false;
        this.carService.getCars().subscribe((res: Page<Vehicle>) => {
          this.availableVehicles.set(res.content.filter(v => v.available));
        });
      }
    });
  }

  // ── Step management methods ──
  goToStep(s: number) {
    if (s > this.step()) return;
    this.step.set(s);
  }

  prevStep() {
    if (this.step() === 3 && this.isPreselectedCar) {
      this.step.set(1);
    } else {
      this.step.set(this.step() - 1);
    }
  }

  nextStep() {
    if (this.step() === 1) {
      if (!this.startDate || !this.endDate) {
        this.toast.error('Selecione as datas de início e fim');
        return;
      }
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (end < start) {
        this.toast.error('A data de devolução não pode ser anterior à data de retirada');
        return;
      }
      
      if (this.isPreselectedCar) {
        this.step.set(3); // Skip step 2 if vehicle is preselected
      } else {
        this.step.set(2);
      }
    } else if (this.step() === 2) {
      if (!this.car()) {
        this.toast.error('Escolha um grupo de carros para prosseguir');
        return;
      }
      this.step.set(3);
    } else if (this.step() === 3) {
      this.step.set(4);
    } else if (this.step() === 4) {
      if (!this.isLoggedIn()) {
        // Save wizard state and redirect to login
        const stateToSave = {
          url: this.router.url,
          startDate: this.startDate,
          endDate: this.endDate,
          startTime: this.startTime,
          endTime: this.endTime,
          pickup: this.pickup,
          returnLoc: this.returnLoc,
          promoCode: this.promoCode,
          kmLimit: this.kmLimit,
          protectionPackage: this.protectionPackage,
          addDriver: this.addDriver,
          youngDriver: this.youngDriver,
          qtyAssento: this.qtyAssento,
          qtyConforto: this.qtyConforto,
          qtyCadeira: this.qtyCadeira,
          car: this.car()
        };
        sessionStorage.setItem('pending_rental_wizard_state', JSON.stringify(stateToSave));
        this.toast.info('Por favor, faça login ou crie sua conta para finalizar a reserva.');
        this.router.navigate(['/login']);
      } else {
        this.step.set(5);
      }
    }
  }

  selectVehicle(vehicle: Vehicle) {
    this.car.set(vehicle);
    this.step.set(3);
  }

  navigateToLogin() {
    const stateToSave = {
      url: this.router.url,
      startDate: this.startDate,
      endDate: this.endDate,
      startTime: this.startTime,
      endTime: this.endTime,
      pickup: this.pickup,
      returnLoc: this.returnLoc,
      promoCode: this.promoCode,
      kmLimit: this.kmLimit,
      protectionPackage: this.protectionPackage,
      addDriver: this.addDriver,
      youngDriver: this.youngDriver,
      qtyAssento: this.qtyAssento,
      qtyConforto: this.qtyConforto,
      qtyCadeira: this.qtyCadeira,
      car: this.car()
    };
    sessionStorage.setItem('pending_rental_wizard_state', JSON.stringify(stateToSave));
    this.router.navigate(['/login']);
  }

  // ── Accessors adjustment methods ──
  incrementQty(item: 'assento' | 'conforto' | 'cadeira') {
    if (item === 'assento') this.qtyAssento++;
    if (item === 'conforto') this.qtyConforto++;
    if (item === 'cadeira') this.qtyCadeira++;
  }

  decrementQty(item: 'assento' | 'conforto' | 'cadeira') {
    if (item === 'assento' && this.qtyAssento > 0) this.qtyAssento--;
    if (item === 'conforto' && this.qtyConforto > 0) this.qtyConforto--;
    if (item === 'cadeira' && this.qtyCadeira > 0) this.qtyCadeira--;
  }

  // ── Autocomplete selections ──
  filterPickupCities() {
    const q = this.pickup.toLowerCase();
    this.filteredPickupCities.set(this.cities.filter(c => c.toLowerCase().includes(q)));
  }

  filterReturnCities() {
    const q = this.returnLoc.toLowerCase();
    this.filteredReturnCities.set(this.cities.filter(c => c.toLowerCase().includes(q)));
  }

  selectPickup(city: string) {
    this.pickup = city;
    this.showPickupSuggestions = false;
  }

  selectReturn(city: string) {
    this.returnLoc = city;
    this.showReturnSuggestions = false;
  }

  // Legacy compatibility method
  calculateTotal() {
    return this.calculation().grandTotal;
  }

  translateCategory(cat: string) {
    const cats: any = {
      'ECONOMY': 'Econômico', 'COMPACT': 'Compacto', 'SUV': 'SUV',
      'LUXURY': 'Luxo', 'SPORT': 'Esportivo', 'VAN': 'Van',
      'SEDAN': 'Sedan', 'HATCH': 'Hatch', 'PICKUP': 'Picape'
    };
    return cats[cat] || cat;
  }

  // Submit booking logic
  confirmBooking() {
    this.isSubmitting.set(true);
    const data = {
      vehicleId: this.car()?.id,
      startDate: this.startDate,
      endDate: this.endDate,
      pickupLocation: this.pickup,
      returnLocation: this.returnLoc,
      insurance: this.protectionPackage !== 'padrao', // maps completeness choice to backend boolean
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
