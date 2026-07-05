import { Component, inject, signal, computed, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarService } from '../../core/services/car';
import { Vehicle, Page, VehicleImage } from '../../core/models/vehicle.model';
import { FavoriteService } from '../../core/services/favorites';
import { ToastService } from '../../core/services/toast';
import { AuthService } from '../../core/services/auth';
import { CarCardComponent } from '../../components/car-card/car-card';
import { LoadingComponent } from '../../components/loading/loading';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CarCardComponent, LoadingComponent],
  template: `
    <div class="detail-container" *ngIf="car(); else loadingTpl">
      <!-- Back Navigation -->
      <div class="back-nav">
        <a class="back-btn" routerLink="/">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Voltar ao Marketplace</span>
        </a>
      </div>

      <div class="main-grid">
        <!-- Left Column: Gallery & Details -->
        <div class="left-col">
          <!-- Image Viewer Card -->
          <div class="image-area">
            <div class="badge-tag" *ngIf="car()?.badge">
              {{ formatBadge(car()?.badge || '') }}
            </div>

            <!-- Main Image with Zoom -->
            <div class="main-image-wrapper"
                 (mouseenter)="zoomActive.set(iSelectedHasImage())"
                 (mouseleave)="zoomActive.set(false)"
                 (mousemove)="onImageMouseMove($event)"
                 #mainImageWrapper>
              <img *ngIf="selectedImageIndex() === 0 || currentSelectedImageUrl()"
                   [src]="selectedImageIndex() === 0 ? galleryImages()[0]?.imageUrl : currentSelectedImageUrl()"
                   [alt]="car()?.brand + ' ' + car()?.model"
                   class="main-image">
              
              <!-- Main Placeholder -->
              <div *ngIf="selectedImageIndex() > 0 && !currentSelectedImageUrl()" class="main-placeholder-content">
                <svg class="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <h3>Imagem em breve</h3>
                <p>Esta vista de ângulo estará disponível em breve.</p>
              </div>
            </div>

            <!-- 5-Image Carousel Thumbnails -->
            <div class="gallery-thumbs">
              <div class="thumb"
                   *ngFor="let img of galleryImages(); let i = index"
                   [class.active]="selectedImageIndex() === i"
                   (click)="selectImage(i)">
                
                <!-- Image element if URL exists -->
                <img *ngIf="i === 0 || img.imageUrl" 
                     [src]="img.imageUrl" 
                     [alt]="'Vista ' + (i + 1)" 
                     (error)="onThumbError($event, i)">
                
                <!-- SVG camera placeholder if URL is empty -->
                <div *ngIf="i > 0 && !img.imageUrl" class="placeholder-thumb-content">
                  <svg class="camera-thumb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span class="placeholder-text">Em breve</span>
                </div>
                
                <div class="thumb-index">{{ i + 1 }}</div>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="description-card" *ngIf="car()?.description">
            <h3>Sobre o Veículo</h3>
            <p>{{ car()?.description }}</p>
            <div class="location-info" *ngIf="car()?.city">
              <svg class="loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Disponível em {{ car()?.city }}, {{ car()?.state }}</span>
            </div>
          </div>

          <!-- Technical Specs Table (Mercado Livre/Movida Style) -->
          <section class="product-specs">
            <h2>Ficha Técnica</h2>
            <div class="specs-table-wrapper">
              <table class="specs-table">
                <tbody>
                  <tr>
                    <td class="spec-key">Marca</td>
                    <td class="spec-value">{{ car()?.brand }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Modelo</td>
                    <td class="spec-value">{{ car()?.model }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Ano</td>
                    <td class="spec-value">{{ car()?.year }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Categoria</td>
                    <td class="spec-value">{{ translateCategory(car()?.categoryName || car()?.['category'] || '') }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Cor</td>
                    <td class="spec-value">
                      <span class="color-dot-sm" [style.background]="getColorHex(car()?.color || '')"></span>
                      {{ translateColor(car()?.color || '') }}
                    </td>
                  </tr>
                  <tr>
                    <td class="spec-key">Combustível</td>
                    <td class="spec-value">{{ translateFuel(car()?.fuelType || '') }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Câmbio</td>
                    <td class="spec-value">{{ translateTransmission(car()?.transmission || '') }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Lugares</td>
                    <td class="spec-value">{{ car()?.seats }} assentos</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Portas</td>
                    <td class="spec-value">{{ car()?.doors }} portas</td>
                  </tr>
                  <tr *ngIf="car()?.mileage !== undefined && car()?.mileage !== null">
                    <td class="spec-key">Quilometragem</td>
                    <td class="spec-value">{{ car()?.mileage | number:'1.0-0':'pt-BR' }} km</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Ar Condicionado</td>
                    <td class="spec-value">{{ car()?.airConditioning ? 'Sim' : 'Não' }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Test Drive Grátis</td>
                    <td class="spec-value">{{ car()?.freeTestDrive ? 'Sim' : 'Não' }}</td>
                  </tr>
                  <tr>
                    <td class="spec-key">Condição</td>
                    <td class="spec-value">
                      <span class="table-badge" [class.new]="car()?.isNew || car()?.['new']">
                        {{ (car()?.isNew || car()?.['new']) ? 'Novo' : 'Seminovo' }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="spec-key">Status</td>
                    <td class="spec-value">
                      <span class="table-badge" [class.available]="car()?.available">
                        {{ car()?.available ? 'Disponível' : 'Indisponível' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Right Column: Specs Panel & Actions -->
        <div class="right-col">
          <!-- Pricing & Info Card -->
          <div class="pricing-card">
            <div class="card-header">
              <div class="condition-badge" *ngIf="car()?.isNew || car()?.['new']">Novo</div>
              <h1 class="vehicle-title">{{ car()?.brand }} {{ car()?.model }}</h1>
              <div class="meta-row">
                <span class="meta-pill">{{ car()?.year }}</span>
                <span class="meta-separator">•</span>
                <span class="meta-category">{{ translateCategory(car()?.categoryName || car()?.['category'] || '') }}</span>
              </div>
            </div>

            <!-- Price Detail -->
            <div class="price-section">
              <div class="price-block">
                <span class="price-label">Mensalidade a partir de</span>
                <div class="price-amount-wrapper">
                  <span class="price-currency">R$</span>
                  <span class="price-value">{{ car()?.pricePerDay ? (car()?.pricePerDay! * 30 | number:'1.2-2':'pt-BR') : '0,00' }}</span>
                  <span class="price-period">/mês</span>
                </div>
                <div class="price-subtext">Ou R$ {{ car()?.pricePerDay | number:'1.2-2':'pt-BR' }}/dia para aluguel avulso</div>
              </div>
              
              <div class="price-block sale-block" *ngIf="car()?.salePrice">
                <span class="price-label">Comprar veículo por</span>
                <div class="price-amount-wrapper sale-amount">
                  <span class="price-currency">R$</span>
                  <span class="price-value">{{ car()?.salePrice | number:'1.0-0':'pt-BR' }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-block">
              <button class="primary-cta" [routerLink]="['/rent', car()?.id]">
                <span>Monte seu plano</span>
                <svg class="arrow-right-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              
              <div class="secondary-actions">
                <button class="secondary-cta buy-cta" *ngIf="car()?.salePrice" (click)="onBuy()">
                  Comprar Veículo
                </button>
                <button class="favorite-cta" (click)="toggleFav()" [class.active]="isFavorited()">
                  <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{{ isFavorited() ? 'Salvo' : 'Favoritar' }}</span>
                </button>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Basic characteristics grid -->
            <div class="basic-specs">
              <div class="spec-item">
                <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <span class="spec-lbl">Motorização</span>
                <span class="spec-val">{{ translateFuel(car()?.fuelType || '') }}</span>
              </div>
              <div class="spec-item">
                <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                </svg>
                <span class="spec-lbl">Transmissão</span>
                <span class="spec-val">{{ translateTransmission(car()?.transmission || '') }}</span>
              </div>
              <div class="spec-item">
                <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="spec-lbl">Capacidade</span>
                <span class="spec-val">{{ car()?.seats }} ocupantes</span>
              </div>
              <div class="spec-item">
                <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M9 3v18"></path>
                </svg>
                <span class="spec-lbl">Portas</span>
                <span class="spec-val">{{ car()?.doors }} portas</span>
              </div>
            </div>

            <!-- Movida-style Included benefits checklist -->
            <div class="included-benefits">
              <h3>Vantagens Inclusas</h3>
              <ul class="benefits-list">
                <li class="benefit-item">
                  <svg class="benefit-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>IPVA e Licenciamento 100% pagos</span>
                </li>
                <li class="benefit-item">
                  <svg class="benefit-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Manutenção preventiva inclusa</span>
                </li>
                <li class="benefit-item">
                  <svg class="benefit-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Proteção contra colisões e terceiros</span>
                </li>
                <li class="benefit-item">
                  <svg class="benefit-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Assistência técnica 24 horas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Zoom Popup Overlay - positioned at main-grid level to overlap info area -->
        <div class="zoom-popup"
             *ngIf="zoomActive() && (selectedImageIndex() === 0 || currentSelectedImageUrl())"
             [style.background-image]="'url(' + (selectedImageIndex() === 0 ? galleryImages()[0]?.imageUrl : currentSelectedImageUrl()) + ')'"
             [style.background-position]="zoomBgPosition()"
             [style.background-size]="'240%'">
        </div>
      </div>

      <!-- Related Cars Grid - Now exactly 4 columns -->
      <section class="related">
        <h2>Recomendados para você</h2>
        <div class="related-grid" *ngIf="relatedCars().length > 0; else noRelated">
          <app-car-card *ngFor="let rc of relatedCars()" [car]="rc"></app-car-card>
        </div>
        <ng-template #noRelated>
            <p class="empty">Nenhum veículo similar encontrado no momento.</p>
        </ng-template>
      </section>
    </div>

    <ng-template #loadingTpl>
      <app-loading></app-loading>
    </ng-template>
  `,
  styles: [`
    .detail-container {
      padding: 40px 24px;
      max-width: var(--max-width);
      margin: 0 auto;
    }

    .back-nav {
      margin-bottom: 24px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      transition: color 0.2s;
      
      .back-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        color: var(--accent);
      }
    }

    /* ===== MAIN GRID ===== */
    .main-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 32px;
      position: relative;
      align-items: start;
    }

    .left-col {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .right-col {
      position: sticky;
      top: 100px;
    }

    /* ===== IMAGE AREA ===== */
    .image-area {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 32px;
      position: relative;
      box-shadow: var(--shadow-sm);
    }

    .badge-tag {
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 6px 14px;
      z-index: 5;
      background: var(--accent-secondary);
      color: white;
      border-radius: var(--radius-full);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: var(--shadow-xs);
    }

    .main-image-wrapper {
      position: relative;
      cursor: crosshair;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: var(--surface-secondary);
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .main-image {
        max-width: 90%;
        max-height: 85%;
        object-fit: contain;
      }
    }

    .main-placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      padding: 40px;
      text-align: center;
      
      .camera-icon {
        width: 48px;
        height: 48px;
        color: var(--accent);
        margin-bottom: 16px;
      }
      h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 6px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--text-secondary);
        max-width: 240px;
      }
    }

    /* ===== GALLERY THUMBNAILS ===== */
    .gallery-thumbs {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: center;
      
      .thumb {
        width: 80px;
        height: 60px;
        border-radius: var(--radius-md);
        border: 2px solid var(--border);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background: var(--surface);
        transition: all 0.2s ease;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s;
        }
        
        .placeholder-thumb-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: var(--surface-secondary);
          color: var(--text-muted);
          
          .camera-thumb-icon {
            width: 18px;
            height: 18px;
            color: var(--text-muted);
            margin-bottom: 2px;
          }
          .placeholder-text {
            font-size: 9px;
            font-weight: 600;
          }
        }
        
        .thumb-index {
          position: absolute;
          bottom: 2px;
          right: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 800;
          color: white;
          background: rgba(0, 0, 0, 0.6);
          padding: 1px 4px;
          border-radius: 4px;
          line-height: 1;
        }
        
        &:hover {
          border-color: var(--text-secondary);
          img {
            transform: scale(1.05);
          }
        }
        
        &.active {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-light);
        }
      }
    }

    /* ===== ZOOM POPUP ===== */
    .zoom-popup {
      position: absolute;
      top: 0;
      right: 0;
      width: calc(40% - 16px);
      height: 466px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      z-index: 500;
      background-repeat: no-repeat;
      background-color: var(--surface);
      box-shadow: var(--shadow-lg);
      pointer-events: none;
      animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;

      &::before {
        content: '🔍 Zoom 2.4x';
        position: absolute;
        top: 16px;
        left: 16px;
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        font-weight: 700;
        color: white;
        background: rgba(0, 0, 0, 0.65);
        padding: 4px 10px;
        border-radius: var(--radius-full);
        z-index: 2;
        letter-spacing: 0.3px;
      }
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    /* ===== DESCRIPTION CARD ===== */
    .description-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 32px;
      box-shadow: var(--shadow-sm);
      
      h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-primary);
      }
      p {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.7;
      }
      .location-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        
        .loc-icon {
          width: 16px;
          height: 16px;
          color: var(--accent);
        }
      }
    }

    /* ===== PRICING PANEL ===== */
    .pricing-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 32px;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .card-header {
      .condition-badge {
        display: inline-block;
        background: var(--accent-light);
        color: var(--accent);
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        margin-bottom: 8px;
      }
      .vehicle-title {
        font-family: 'Outfit', sans-serif;
        font-size: 28px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.15;
      }
      .meta-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    .price-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--surface-secondary);
      padding: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .price-block {
      display: flex;
      flex-direction: column;
      
      .price-label {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }
      
      .price-amount-wrapper {
        display: flex;
        align-items: baseline;
        font-family: 'Outfit', sans-serif;
        color: var(--price-color);
        
        .price-currency {
          font-size: 18px;
          font-weight: 700;
          margin-right: 4px;
        }
        .price-value {
          font-size: 32px;
          font-weight: 800;
        }
        .price-period {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-left: 2px;
        }
      }
      
      .price-subtext {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
        font-weight: 500;
      }
    }

    .sale-block {
      border-top: 1px solid var(--border);
      padding-top: 12px;
      
      .sale-amount {
        color: var(--text-primary);
        .price-value {
          font-size: 26px;
        }
      }
    }

    .action-block {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .primary-cta {
      width: 100%;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      padding: 16px 24px;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      
      .arrow-right-icon {
        width: 16px;
        height: 16px;
        transition: transform 0.2s;
      }
      
      &:hover {
        background-color: var(--accent-hover);
        box-shadow: 0 4px 12px var(--accent-light);
        .arrow-right-icon {
          transform: translateX(4px);
        }
      }
      &:active {
        transform: scale(0.99);
      }
    }

    .secondary-actions {
      display: flex;
      gap: 12px;
    }

    .secondary-cta {
      flex: 1;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 700;
      background: var(--surface);
      border: 1.5px solid var(--border);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      
      &:hover {
        border-color: var(--text-secondary);
        background: var(--surface-hover);
      }
    }

    .buy-cta {
      border-color: var(--text-primary);
      &:hover {
        background: var(--text-primary);
        color: var(--surface);
        border-color: var(--text-primary);
      }
    }

    .favorite-cta {
      flex: 1;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      background: var(--surface);
      border: 1.5px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
      
      .heart-icon {
        width: 15px;
        height: 15px;
        fill: none;
        stroke: currentColor;
        transition: fill 0.2s, stroke 0.2s;
      }
      
      &:hover {
        border-color: var(--text-secondary);
        color: var(--text-primary);
      }
      
      &.active {
        border-color: rgba(239, 68, 68, 0.2);
        background: rgba(239, 68, 68, 0.04);
        color: #EF4444;
        .heart-icon {
          fill: #EF4444;
        }
      }
    }

    .divider {
      height: 1px;
      background: var(--border-light);
    }

    .basic-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .spec-icon {
        width: 18px;
        height: 18px;
        color: var(--accent);
        margin-bottom: 4px;
      }
      
      .spec-lbl {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      
      .spec-val {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }

    /* ===== INCLUDED BENEFITS ===== */
    .included-benefits {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }

    .benefits-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
      
      .benefit-check {
        width: 14px;
        height: 14px;
        color: var(--accent);
        flex-shrink: 0;
      }
    }

    /* ===== SPECS TABLE ===== */
    .product-specs {
      h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
    }

    .specs-table-wrapper {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
      
      tr {
        border-bottom: 1px solid var(--border-light);
        &:last-child {
          border-bottom: none;
        }
        &:nth-child(even) {
          background: var(--surface-secondary);
        }
      }
      
      td {
        padding: 14px 20px;
        font-family: 'Inter', sans-serif;
        font-size: 13.5px;
      }
      
      .spec-key {
        font-weight: 600;
        color: var(--text-secondary);
        width: 180px;
      }
      
      .spec-value {
        font-weight: 700;
        color: var(--text-primary);
      }
      
      .color-dot-sm {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        border: 1px solid rgba(128,128,128,0.2);
      }
      
      .table-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: 11px;
        font-weight: 700;
        background: var(--surface-secondary);
        color: var(--text-secondary);
        
        &.new {
          background: var(--accent-light);
          color: var(--accent);
        }
        
        &.available {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }
      }
    }

    /* ===== RELATED ===== */
    .related {
      margin-top: 48px;
      border-top: 1px solid var(--border);
      padding-top: 48px;
      
      h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 24px;
        color: var(--text-primary);
      }
      
      .related-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }
      
      .empty {
        text-align: center;
        color: var(--text-secondary);
        padding: 32px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
      }
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .main-grid {
        grid-template-columns: 1fr;
      }
      
      .right-col {
        position: static;
      }
      
      .zoom-popup {
        display: none;
      }
      
      .related-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }

    @media (max-width: 600px) {
      .detail-container {
        padding: 24px 16px;
      }
      
      .image-area {
        padding: 16px;
      }
      
      .main-image-wrapper {
        height: 280px;
      }
      
      .gallery-thumbs .thumb {
        width: 60px;
        height: 45px;
      }
      
      .pricing-card {
        padding: 24px;
      }
      
      .card-header .vehicle-title {
        font-size: 24px;
      }
      
      .price-section {
        padding: 16px;
      }
      
      .price-block .price-amount-wrapper .price-value {
        font-size: 26px;
      }
      
      .specs-table td {
        padding: 12px 16px;
      }
      
      .specs-table .spec-key {
        width: 120px;
      }
      
      .related-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class CarDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private carService = inject(CarService);
  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  @ViewChild('mainImageWrapper') mainImageWrapper!: ElementRef;

  car = signal<Vehicle | undefined>(undefined);
  backendImages = signal<VehicleImage[]>([]);
  relatedCars = signal<Vehicle[]>([]);
  isFavorited = signal(false);
  selectedImageIndex = signal(0);
  zoomActive = signal(false);
  zoomBgPosition = signal('center center');

  // Combine main image and backend gallery images
  galleryImages = computed(() => {
    const c = this.car();
    if (!c) return [];
    
    const list: any[] = [];
    // Index 0: main image
    list.push({
      id: 0,
      position: 1,
      imageUrl: c.imageUrl
    });
    
    // Index 1-4: backend gallery images
    const backendImgs = this.backendImages();
    if (backendImgs && backendImgs.length > 0) {
      list.push(...backendImgs);
    } else if (c.galleryImages && c.galleryImages.length > 0) {
      list.push(...c.galleryImages);
    } else {
      // Fallback placeholder structure before images are loaded
      for (let pos = 2; pos <= 5; pos++) {
        list.push({
          id: -pos,
          position: pos,
          imageUrl: ''
        });
      }
    }
    return list;
  });

  iSelectedHasImage = computed(() => {
    const idx = this.selectedImageIndex();
    if (idx === 0) return true;
    const imgs = this.galleryImages();
    return !!(imgs[idx] && imgs[idx].imageUrl);
  });

  currentSelectedImageUrl = computed(() => {
    const idx = this.selectedImageIndex();
    const imgs = this.galleryImages();
    return imgs[idx] ? imgs[idx].imageUrl : '';
  });

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      const id = +params['id'];
      this.selectedImageIndex.set(0);
      window.scrollTo({ top: 0, behavior: 'instant' });
      this.loadCar(id);
    });
  }

  loadCar(id: number) {
    this.carService.getById(id).subscribe((car: Vehicle) => {
      this.car.set(car);
      if (car) {
        this.loadRelated(car);
        if (this.authService.isLoggedIn()) {
          this.favoriteService.checkFavorite(car.id).subscribe((res: any) => this.isFavorited.set(res.favorited));
        }

        // Fetch gallery images from backend
        this.carService.getGalleryImages(car.id).subscribe({
          next: (images: VehicleImage[]) => {
            this.backendImages.set(images);
          },
          error: (err: any) => {
            console.error('Failed to load gallery images', err);
          }
        });
      }
    });
  }

  loadRelated(car: Vehicle) {
    this.carService.getCars({ size: 12 }).subscribe({
      next: (res: Page<Vehicle>) => {
        const allVehicles = res.content || [];

        const currentId = car.id;
        
        const scored = allVehicles
          .filter((v: Vehicle) => v.id !== currentId && v.available)
          .map((v: Vehicle) => {
            let score = 0;
            
            const targetCat = (car.categoryName || car.category || '').toUpperCase();
            const candidateCat = (v.categoryName || v.category || '').toUpperCase();
            
            if (targetCat === candidateCat) {
              score += 100;
            } else {
              const utilityCats = ['SUV', 'VAN', 'PICKUP'];
              const premiumCats = ['LUXURY', 'SPORT'];
              const urbanCats = ['ECONOMY', 'COMPACT', 'INTERMEDIATE', 'SEDAN', 'HATCH'];
              
              if (utilityCats.includes(targetCat) && utilityCats.includes(candidateCat)) {
                score += 40;
              } else if (premiumCats.includes(targetCat) && premiumCats.includes(candidateCat)) {
                score += 40;
              } else if (urbanCats.includes(targetCat) && urbanCats.includes(candidateCat)) {
                score += 40;
              }
            }
            
            if (v.brand.toLowerCase() === car.brand.toLowerCase()) {
              score += 30;
            }
            
            if (v.fuelType === car.fuelType) {
              score += 20;
            }
            
            if (v.transmission === car.transmission) {
              score += 20;
            }
            
            const priceDiff = Math.abs(v.pricePerDay - car.pricePerDay);
            const priceRatio = priceDiff / (car.pricePerDay || 1);
            if (priceRatio <= 0.1) {
              score += 40;
            } else if (priceRatio <= 0.25) {
              score += 20;
            } else if (priceRatio <= 0.5) {
              score += 10;
            }
            
            const yearDiff = Math.abs(v.year - car.year);
            if (yearDiff === 0) {
              score += 15;
            } else if (yearDiff <= 1) {
              score += 10;
            } else if (yearDiff <= 3) {
              score += 5;
            }
            
            if (v.badge) {
              score += 10;
            }
            
            const seed = Math.sin(v.id * 10 + car.id) * 8;
            score += seed;
            
            return { vehicle: v, score };
          });
        
        const top4 = scored
          .sort((a, b) => b.score - a.score)
          .map(item => item.vehicle)
          .slice(0, 4);
          
        this.relatedCars.set(top4);
      },
      error: (err: any) => {
        console.error('Failed to load related cars', err);
        const category = car.categoryName || (car as any).category || '';
        this.carService.getCars({ category, size: 5 }).subscribe((res: Page<Vehicle>) => {
          this.relatedCars.set(res.content.filter((v: Vehicle) => v.id !== car.id).slice(0, 4));
        });
      }
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  onImageMouseMove(event: MouseEvent) {
    const wrapper = this.mainImageWrapper?.nativeElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.zoomBgPosition.set(`${x}% ${y}%`);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop';
  }

  onThumbError(event: Event, index: number) {
    const img = event.target as HTMLImageElement;
    const fallbacks = [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=400',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=400',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400',
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=400',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=400',
    ];
    img.src = fallbacks[index % fallbacks.length];
  }

  toggleFav() {
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Faça login para favoritar');
      return;
    }
    const c = this.car();
    if (c) {
      this.favoriteService.toggleFavorite(c.id).subscribe(() => {
        this.isFavorited.update(v => !v);
        this.toast.success('Lista de desejos atualizada');
      });
    }
  }

  onBuy() {
    const c = this.car();
    if (!c) return;
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Faça login para comprar');
      return;
    }
    this.toast.success(`Interesse registrado! Entraremos em contato sobre o ${c.brand} ${c.model}.`);
  }

  formatBadge(badge: string) {
    return badge.replace(/_/g, ' ');
  }

  translateCategory(cat: string) {
    const cats: Record<string, string> = {
      'ECONOMY': 'Econômico', 'COMPACT': 'Compacto', 'SUV': 'SUV',
      'LUXURY': 'Luxo', 'SPORT': 'Esportivo', 'VAN': 'Van',
      'SEDAN': 'Sedã', 'HATCH': 'Hatch', 'PICKUP': 'Picape'
    };
    return cats[cat] || cat;
  }

  translateFuel(fuel: string) {
    const fuels: Record<string, string> = {
      'FLEX': 'Flex', 'GASOLINE': 'Gasolina', 'DIESEL': 'Diesel',
      'ELECTRIC': 'Elétrico', 'HYBRID': 'Híbrido', 'ETHANOL': 'Etanol'
    };
    return fuels[fuel] || fuel;
  }

  translateTransmission(t: string) {
    const trans: Record<string, string> = {
      'AUTOMATIC': 'Automático', 'MANUAL': 'Manual', 'CVT': 'CVT'
    };
    return trans[t] || t;
  }

  translateColor(color: string) {
    const colors: Record<string, string> = {
      'White': 'Branco', 'Black': 'Preto', 'Silver': 'Prata',
      'Red': 'Vermelho', 'Blue': 'Azul', 'Gray': 'Cinza',
      'Grey': 'Cinza', 'Green': 'Verde', 'Yellow': 'Amarelo',
      'Orange': 'Laranja', 'Brown': 'Marrom', 'Beige': 'Bege'
    };
    return colors[color] || color;
  }

  getColorHex(color: string) {
    const map: Record<string, string> = {
      'White': '#f5f5f5', 'Black': '#222', 'Silver': '#c0c0c0',
      'Red': '#e53935', 'Blue': '#1e88e5', 'Gray': '#9e9e9e',
      'Grey': '#9e9e9e', 'Green': '#43a047', 'Yellow': '#fdd835',
      'Orange': '#fb8c00', 'Brown': '#795548', 'Beige': '#d7ccc8'
    };
    return map[color] || '#888';
  }
}
