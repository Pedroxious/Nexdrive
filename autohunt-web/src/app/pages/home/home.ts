import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, effect, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CarService } from '../../core/services/car';
import { Vehicle, Page } from '../../core/models/vehicle.model';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar';
import { CarCardComponent } from '../../components/car-card/car-card';

import { ActiveFiltersComponent, ActiveFilter } from '../../components/active-filters/active-filters';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterSidebarComponent,
    CarCardComponent,
    ActiveFiltersComponent
  ],
  template: `
    <!-- ZONA 1 — Hero full-bleed -->
    <div class="hero-zone">
      <div class="hero-banner">
        <div class="hero-slides">
          @for (slide of heroSlides; track slide.src; let i = $index) {
            <div class="hero-slide" [class.active]="heroIndex() === i">
              <img [src]="slide.src" [alt]="slide.alt" />
            </div>
          }
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-dots">
          @for (slide of heroSlides; track slide.src; let i = $index) {
            <button class="hero-dot" [class.active]="heroIndex() === i" (click)="setHeroSlide(i)"></button>
          }
        </div>
        <div class="hero-progress-container">
          @for (slide of heroSlides; track slide.src; let i = $index) {
            @if (heroIndex() === i) {
              <div class="hero-progress-bar"></div>
            }
          }
        </div>
      </div>

      <!-- Search Bar: half inside hero, half outside -->
      <div class="hero-search-anchor" (click)="$event.stopPropagation()">
        <div class="hero-search-inner">
          <svg class="hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            class="hero-search-input"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            (keydown.enter)="onSearchEnter()"
            placeholder="Buscar por marca, modelo ou categoria..."
          />
          @if (searchQuery()) {
            <button class="hero-search-clear" (click)="clearSearch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          }
          <button class="hero-search-btn" (click)="onSearchEnter()">Buscar</button>
        </div>
      </div>
    </div>

    <!-- Mobile Brand Filter Strip -->
    <div class="mobile-brand-strip">
      <div class="mobile-brand-scroll">
        @for (brand of mobileBrands; track brand) {
          <button
            class="mobile-brand-chip"
            [class.active]="selectedBrands().includes(brand)"
            (click)="toggleMobileBrand(brand)"
          >
            <img
              [src]="'/assets/logos/' + mobileBrandFileName(brand) + '.png'"
              [alt]="brand"
              class="mobile-brand-logo"
              (error)="onMobileBrandError($event, brand)"
              draggable="false"
            />
            <span class="mobile-brand-name">{{ brand }}</span>
          </button>
        }
      </div>
    </div>

    <!-- ZONA 2 — Sidebar + Grid -->
    <div class="content-zone">
      <div class="content-inner">
        <aside class="sidebar-wrapper">
          <app-filter-sidebar 
            [(testDrive)]="testDrive"
            [(carType)]="carType"
            [(selectedBrands)]="selectedBrands"
            [(minPrice)]="minPrice"
            [(maxPrice)]="maxPrice"
            [(selectedFuels)]="selectedFuels"
            [(selectedTrans)]="selectedTrans"
            (changed)="loadCars()"
          />
        </aside>

        <section class="main-content">
          <div class="results-info">
            <div class="results-count">
              <h2>{{ isLoading() ? 'Buscando veiculos...' : totalElements() + ' Veiculos Encontrados' }}</h2>
            </div>
            <div class="sort-controls">
              <span class="sort-label">Ordenar por:</span>
              <div class="custom-select" (click)="toggleSortDropdown($event)">
                <div class="custom-select-trigger">
                  <span>{{ currentSortLabel() }}</span>
                  <svg class="custom-select-arrow" [class.open]="showSortDropdown()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div class="custom-select-dropdown" *ngIf="showSortDropdown()" (click)="$event.stopPropagation()">
                  @for (opt of sortOptions; track opt.value) {
                    <button class="custom-select-option" [class.active]="sortBy() === opt.value" (click)="selectSort(opt.value)">
                      <svg class="opt-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>{{ opt.label }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <app-active-filters 
            [filters]="activeFilters()" 
            (remove)="removeFilter($event)" 
            (clearAll)="resetAllFilters()"
          />

          <div class="car-grid" *ngIf="isLoading()">
            @for (i of skeletonCards; track i) {
              <div class="skeleton-card">
                <div class="skeleton-image shimmer"></div>
                <div class="skeleton-body">
                  <div class="skeleton-line wide shimmer"></div>
                  <div class="skeleton-line medium shimmer"></div>
                  <div class="skeleton-specs">
                    <div class="skeleton-spec shimmer"></div>
                    <div class="skeleton-spec shimmer"></div>
                    <div class="skeleton-spec shimmer"></div>
                  </div>
                  <div class="skeleton-footer">
                    <div class="skeleton-price shimmer"></div>
                    <div class="skeleton-btn shimmer"></div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="car-grid" *ngIf="!isLoading()">
            @for (car of vehicles(); track car.id; let idx = $index) {
              <app-car-card 
                [car]="car" 
                class="animate-card" 
                [style.animation-delay]="idx * 40 + 'ms'" 
              />
            }
          </div>

          <nav class="pagination-bar" *ngIf="totalPages() > 1 && !isLoading()" aria-label="Paginacao">
            <button class="pg-btn pg-nav clickable" [disabled]="currentPage() === 0" (click)="setPage(currentPage() - 1)">
              <span class="pg-arrow">&#8592;</span> <span class="pg-nav-text">Anterior</span>
            </button>
            <div class="pg-numbers">
              @for (p of visiblePages(); track $index) {
                @if (p === -1) {
                  <span class="pg-ellipsis">&#8230;</span>
                } @else {
                  <button class="pg-btn pg-num clickable" [class.active]="p === currentPage()" (click)="setPage(p)">{{ p + 1 }}</button>
                }
              }
            </div>
            <span class="pg-mobile-info">Pagina {{ currentPage() + 1 }} de {{ totalPages() }}</span>
            <button class="pg-btn pg-nav clickable" [disabled]="currentPage() === totalPages() - 1" (click)="setPage(currentPage() + 1)">
              <span class="pg-nav-text">Proxima</span> <span class="pg-arrow">&#8594;</span>
            </button>
          </nav>

          <div class="empty-state" *ngIf="!isLoading() && vehicles().length === 0">
            <span class="icon">&#128269;</span>
            <h3>Nenhum veiculo encontrado</h3>
            <p>Tente ajustar seus filtros para encontrar o que procura.</p>
            <button class="reset-btn clickable" (click)="resetAllFilters()">Limpar Filtros</button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    /* ══════════════════════════════════════════
       ZONA 1 — Hero full-bleed
       ══════════════════════════════════════════ */
    :host {
      display: block;
    }

    .hero-zone {
      position: relative;
      width: 100%;
      margin-bottom: 0;
    }

    .hero-banner {
      position: relative;
      width: 100%;
      height: calc(100vh - var(--navbar-height, 72px));
      max-height: 600px;
      overflow: hidden;
    }

    .hero-slides {
      position: absolute;
      inset: 0;
    }

    .hero-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      &.active {
        opacity: 1;
      }
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(10, 22, 40, 0) 40%, rgba(10, 22, 40, 0.55) 100%);
      z-index: 1;
      pointer-events: none;
    }

    .hero-progress-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.15);
      z-index: 3;
    }

    .hero-progress-bar {
      height: 100%;
      background: var(--accent);
      width: 0;
      animation: heroProgress 6000ms linear forwards;
    }

    @keyframes heroProgress {
      from { width: 0%; }
      to { width: 100%; }
    }

    .hero-dots {
      position: absolute;
      bottom: 52px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      display: flex;
      gap: 8px;
    }

    .hero-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.4);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
      &:hover {
        background: rgba(255,255,255,0.7);
      }
      &.active {
        background: #00BFFF;
        width: 24px;
        border-radius: var(--radius-full);
        box-shadow: 0 0 10px rgba(0, 191, 255, 0.50);
      }
    }

    /* ── Search Bar: half-in, half-out ── */
    .hero-search-anchor {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      z-index: 10;
      width: 70%;
      max-width: 820px;
    }

    .hero-search-inner {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 100px;
      padding: 8px 8px 8px 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.06);
      transition: box-shadow 0.3s ease;
      &:focus-within {
        box-shadow: 0 12px 48px rgba(0, 191, 255, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }

    :host-context([data-theme='dark']) .hero-search-inner {
      background: var(--surface);
      border-color: var(--border);
    }

    :host-context([data-theme='dark']) .hero-search-input {
      color: var(--text-primary);
    }

    .hero-search-icon {
      width: 22px;
      height: 22px;
      color: #00BFFF;
      flex-shrink: 0;
      margin-right: 14px;
    }

    .hero-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-size: 16px;
      font-weight: 500;
      color: #0a1628;
      font-family: 'Inter', sans-serif;
      min-width: 0;
      &::placeholder {
        color: #8896a8;
      }
    }

    .hero-search-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      margin-right: 4px;
      svg {
        width: 18px;
        height: 18px;
        color: #8896a8;
      }
      &:hover svg {
        color: #0a1628;
      }
    }

    .hero-search-btn {
      flex-shrink: 0;
      background: #00BFFF;
      color: #0a1628;
      border: none;
      padding: 14px 36px;
      border-radius: 100px;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.1s ease;
      &:hover {
        background: #00d4ff;
      }
      &:active {
        transform: scale(0.97);
      }
    }

    /* ══════════════════════════════════════════
       ZONA 2 — Content zone (sidebar + grid)
       ══════════════════════════════════════════ */
    .content-zone {
      padding-top: 48px;
      background: var(--bg, #F8F9FA);
      min-height: 80vh;
    }

    :host-context([data-theme='dark']) .content-zone {
      background: var(--bg, #0d1b2a);
    }

    .content-inner {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 28px;
      padding: 0 24px 40px;
      max-width: var(--max-width);
      margin: 0 auto;
    }

    .main-content {
      min-width: 0;
    }

    .results-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 14px 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xs);

      .results-count h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .sort-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .sort-label {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    /* ── Custom Sort Dropdown ── */
    .custom-select {
      position: relative;
      user-select: none;
    }

    .custom-select-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      background: var(--surface);
      border: 1.5px solid var(--border);
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      &:hover {
        border-color: var(--accent);
        background: var(--accent-light);
      }
    }

    .custom-select-arrow {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      transition: transform 0.25s ease;
      flex-shrink: 0;
      &.open {
        transform: rotate(180deg);
        color: var(--accent);
      }
    }

    .custom-select-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 220px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.10);
      z-index: 100;
      overflow: hidden;
      animation: sortDropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes sortDropIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .custom-select-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 11px 14px;
      background: transparent;
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      .opt-check {
        width: 16px;
        height: 16px;
        opacity: 0;
        color: var(--accent);
        flex-shrink: 0;
        transition: opacity 0.15s;
      }
      &:hover {
        background: var(--accent-light);
        color: var(--text-primary);
      }
      &.active {
        color: var(--accent);
        font-weight: 700;
        background: var(--accent-light);
        .opt-check { opacity: 1; }
      }
      &:not(:last-child) {
        border-bottom: 1px solid var(--border-light);
      }
    }

    .car-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    /* ── Skeleton Loading Cards ── */
    .skeleton-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .skeleton-image { height: 200px; background: var(--surface-secondary); }
    .skeleton-body { padding: 16px 18px 18px; }
    .skeleton-line {
      height: 14px; border-radius: 6px; background: var(--surface-secondary); margin-bottom: 10px;
      &.wide { width: 75%; }
      &.medium { width: 50%; }
    }
    .skeleton-specs { display: flex; gap: 6px; margin-bottom: 16px; margin-top: 14px; }
    .skeleton-spec { width: 60px; height: 28px; border-radius: var(--radius-xs); background: var(--surface-secondary); }
    .skeleton-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-light); }
    .skeleton-price { width: 100px; height: 30px; border-radius: 6px; background: var(--surface-secondary); }
    .skeleton-btn { width: 80px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-secondary); }

    .shimmer {
      position: relative; overflow: hidden;
      &::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 60%, transparent 100%);
        animation: shimmerAnim 1.5s infinite;
      }
    }
    @keyframes shimmerAnim { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

    .pagination-bar {
      display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 32px;
      padding: 8px 16px; background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-full); box-shadow: var(--shadow-sm); width: fit-content;
      margin-left: auto; margin-right: auto;
    }
    .pg-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border: none; background: transparent; color: var(--text-secondary);
      font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s ease; border-radius: var(--radius-full); white-space: nowrap;
    }
    .pg-nav {
      padding: 8px 16px;
      &:hover:not(:disabled) { background: var(--accent-light); color: var(--accent); }
      &:disabled { opacity: 0.35; cursor: not-allowed; }
    }
    .pg-arrow { font-size: 14px; line-height: 1; }
    .pg-numbers { display: flex; align-items: center; gap: 4px; }
    .pg-num {
      width: 36px; height: 36px;
      &:hover:not(.active) { background: var(--accent-light); color: var(--accent); }
      &.active { background: var(--accent); color: var(--text-inverse); font-weight: 700; box-shadow: var(--shadow-sm); }
    }
    .pg-ellipsis {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 36px; color: var(--text-muted); font-size: 14px; font-weight: 700; letter-spacing: 2px; user-select: none;
    }
    .pg-mobile-info { display: none; font-weight: 700; font-size: 13px; color: var(--text-secondary); padding: 0 12px; }

    .animate-card {
      opacity: 0; transform: translateY(12px);
      animation: cardFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes cardFadeUp { to { opacity: 1; transform: translateY(0); } }

    .empty-state {
      text-align: center; padding: 80px 0; background: var(--surface);
      border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
      .icon { font-size: 48px; display: block; margin-bottom: 16px; }
      h3 { font-family: 'Outfit', sans-serif; font-size: 20px; margin-bottom: 8px; color: var(--text-primary); }
      p { font-family: 'Inter', sans-serif; color: var(--text-secondary); margin-bottom: 24px; font-size: 14px; }
      .reset-btn {
        background: var(--accent); color: var(--text-inverse); border: none; padding: 12px 28px;
        border-radius: var(--radius-full); font-weight: 700; font-size: 14px;
        transition: background-color 0.2s, transform 0.1s;
        &:hover { background-color: var(--accent-hover); }
        &:active { transform: scale(0.98); }
      }
    }

    /* ── Mobile Brand Filter Strip ── */
    .mobile-brand-strip {
      display: none;
      padding: 12px 16px 4px;
      max-width: var(--max-width);
      margin: 0 auto;
      overflow: hidden;
    }

    .mobile-brand-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: 4px;
      &::-webkit-scrollbar { display: none; }
    }

    .mobile-brand-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      min-width: 68px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      &:hover { border-color: var(--text-secondary); }
      &.active {
        border-color: var(--accent);
        background: var(--accent-light);
        .mobile-brand-name { color: var(--accent); font-weight: 700; }
        .mobile-brand-logo {
          filter: brightness(0) saturate(100%) invert(55%) sepia(98%) saturate(1000%) hue-rotate(160deg) brightness(1.1);
        }
      }
    }

    .mobile-brand-logo {
      height: 22px;
      width: auto;
      max-width: 44px;
      object-fit: contain;
      transition: filter 0.2s ease;
    }

    :host-context([data-theme='dark']) .mobile-brand-logo {
      filter: brightness(0) invert(1);
    }
    :host-context([data-theme='dark']) .mobile-brand-chip.active .mobile-brand-logo {
      filter: brightness(0) saturate(100%) invert(55%) sepia(98%) saturate(1000%) hue-rotate(160deg) brightness(1.1);
    }

    .mobile-brand-name {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 56px;
    }

    /* ══ Responsive ══ */
    @media (max-width: 1200px) {
      .car-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 992px) {
      .content-inner { grid-template-columns: 1fr; gap: 12px; }
      .sidebar-wrapper { display: none; }
      .mobile-brand-strip { display: block; }
      .car-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-search-anchor { width: 80%; }
      .results-info { margin-bottom: 12px; }
    }

    @media (max-width: 768px) {
      .hero-banner { height: 52vw; min-height: 200px; max-height: 320px; }
      .hero-slide img { object-fit: contain; object-position: center; background: var(--bg-navbar); }
      .hero-dots { bottom: 36px; gap: 6px; }
      .hero-dot { width: 7px; height: 7px; &.active { width: 20px; } }
      .hero-search-anchor { width: 92%; }
      .hero-search-inner { padding: 6px 6px 6px 16px; }
      .hero-search-btn { padding: 11px 20px; font-size: 13px; }
      .hero-search-input { font-size: 14px; }
      .content-zone { padding-top: 32px; }
      .content-inner { padding: 0 14px 28px; gap: 10px; }
      .car-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .results-info {
        padding: 10px 14px; margin-bottom: 8px;
        .results-count h2 { font-size: 16px; }
      }
    }

    @media (max-width: 480px) {
      .hero-zone { margin-bottom: 0; }
      .hero-banner { height: 48vw; min-height: 170px; max-height: 260px; }
      .hero-slide img { object-fit: contain; background: var(--bg-navbar); }
      .hero-dots { bottom: 28px; gap: 5px; }
      .hero-dot { width: 6px; height: 6px; &.active { width: 18px; } }
      .hero-search-anchor { width: 94%; }
      .hero-search-inner { padding: 4px 4px 4px 12px; }
      .hero-search-icon { width: 16px; height: 16px; margin-right: 8px; }
      .hero-search-btn { padding: 9px 14px; font-size: 11px; }
      .hero-search-input { font-size: 13px; &::placeholder { font-size: 11px; } }
      .hero-search-clear { width: 24px; height: 24px; svg { width: 13px; height: 13px; } }
      .content-zone { padding-top: 24px; }
      .content-inner { padding: 0 10px 24px; gap: 8px; }
      .car-grid { grid-template-columns: 1fr; gap: 12px; }
      .pg-numbers { display: none; }
      .pg-mobile-info { display: inline-flex; }
      .pg-nav-text { display: none; }
      .pagination-bar { gap: 4px; padding: 6px 10px; }
      .pg-nav { padding: 6px 10px; }
      .results-info {
        flex-direction: column; align-items: flex-start; gap: 8px;
        padding: 10px 12px; margin-bottom: 4px;
        .results-count h2 { font-size: 15px; }
        .sort-controls { width: 100%; justify-content: space-between; }
        .custom-select-trigger { padding: 7px 10px; font-size: 11px; }
        .custom-select-dropdown { min-width: 190px; }
        .custom-select-option { padding: 10px 12px; font-size: 12px; }
        .sort-label { font-size: 12px; }
      }
      .empty-state { padding: 40px 14px; }
      .mobile-brand-strip { padding: 16px 10px 4px; }
      .mobile-brand-chip { padding: 6px 10px; min-width: 60px; }
      .mobile-brand-logo { height: 18px; max-width: 38px; }
      .mobile-brand-name { font-size: 9px; max-width: 48px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private carService = inject(CarService);
  private route = inject(ActivatedRoute);
  private heroInterval: any;

  // Skeleton loading placeholder
  skeletonCards = Array.from({ length: 6 }, (_, i) => i);

  // Hero Carousel — 10 local banner slides
  heroIndex = signal(0);
  heroSlides = [
    { src: '/assets/slides/BG.webp',   alt: 'NexDrive Banner 1' },
    { src: '/assets/slides/BG2.webp',  alt: 'NexDrive Banner 2' },
    { src: '/assets/slides/BG3.webp',  alt: 'NexDrive Banner 3' },
    { src: '/assets/slides/BG4.webp',  alt: 'NexDrive Banner 4' },
    { src: '/assets/slides/BG5.webp',  alt: 'NexDrive Banner 5' },
    { src: '/assets/slides/BG7.webp',  alt: 'NexDrive Banner 7' },
    { src: '/assets/slides/BG8.webp',  alt: 'NexDrive Banner 8' },
    { src: '/assets/slides/BG9.webp',  alt: 'NexDrive Banner 9' },
    { src: '/assets/slides/BG10.webp', alt: 'NexDrive Banner 10' },
    { src: '/assets/slides/BGE.webp',  alt: 'NexDrive Banner E'  },
  ];

  // Mobile brand filter strip
  mobileBrands = [
    'Toyota', 'Honda', 'Chevrolet', 'Volkswagen', 'Fiat', 'Jeep',
    'Hyundai', 'Nissan', 'Renault', 'Ford', 'BMW', 'Mercedes-Benz',
    'Tesla', 'BYD', 'Volvo', 'Porsche'
  ];

  mobileBrandFileName(brand: string): string {
    const nameMap: Record<string, string> = {
      'Mercedes-Benz': 'mercedes-benz',
      'Caoa Chery': 'chery',
      'Range Rover': 'land-rover',
      'Citroën': 'citroen',
    };
    return nameMap[brand] || brand.toLowerCase();
  }

  toggleMobileBrand(brand: string) {
    this.selectedBrands.update(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    this.loadCars();
  }

  onMobileBrandError(event: Event, brand: string) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  constructor() {
    effect(() => {
      // Re-load cars whenever selectedLocation changes
      this.carService.selectedLocation();
      this.loadCars();
    });
    this.startHeroAutoSlide();
  }

  private startHeroAutoSlide() {
    this.heroInterval = setInterval(() => {
      this.heroIndex.update(idx => (idx + 1) % this.heroSlides.length);
    }, 6000);
  }

  setHeroSlide(i: number) {
    this.heroIndex.set(i);
    clearInterval(this.heroInterval);
    this.startHeroAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.heroInterval);
  }

  // Pagination & Loading
  vehicles = signal<Vehicle[]>([]);
  isLoading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  // Computed visible page numbers with ellipsis (-1 = ellipsis)
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: number[] = [];
    pages.push(0); // always show first

    if (current > 2) pages.push(-1); // left ellipsis

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push(-1); // right ellipsis

    pages.push(total - 1); // always show last
    return pages;
  });

  // States
  searchQuery = signal('');
  sortBy = signal('pricePerDay,asc');
  showSortDropdown = signal(false);

  sortOptions = [
    { value: 'pricePerDay,asc', label: 'Preço: Menor → Maior' },
    { value: 'pricePerDay,desc', label: 'Preço: Maior → Menor' },
    { value: 'year,desc', label: 'Mais Recentes' }
  ];

  currentSortLabel = computed(() => {
    const opt = this.sortOptions.find(o => o.value === this.sortBy());
    return opt ? opt.label : 'Ordenar';
  });

  toggleSortDropdown(e: Event) {
    e.stopPropagation();
    this.showSortDropdown.update(v => !v);
  }

  selectSort(value: string) {
    this.sortBy.set(value);
    this.showSortDropdown.set(false);
    this.loadCars();
  }

  @HostListener('document:click')
  onDocClick() {
    this.showSortDropdown.set(false);
  }

  // Filters
  testDrive = signal(false);
  carType = signal('all'); // all, new, used
  selectedBrands = signal<string[]>([]);
  minPrice = signal(0);
  maxPrice = signal(1000);
  selectedFuels = signal<string[]>([]);
  selectedTrans = signal<string[]>([]);

  ngOnInit() {
    this.route.url.subscribe(() => {
      this.carType.set('all');
      this.loadCars();
    });
  }

  loadCars() {
    this.isLoading.set(true);

    const filters: any = {
      page: this.currentPage(),
      size: 12,
      sort: this.sortBy()
    };

    if (this.testDrive()) filters.freeTestDrive = true;
    if (this.carType() === 'new') filters.isNew = true;
    if (this.carType() === 'used') filters.isNew = false;
    if (this.selectedBrands().length > 0) filters.brands = this.selectedBrands();
    if (this.minPrice() > 0) filters.minPrice = this.minPrice();
    if (this.maxPrice() < 1000) filters.maxPrice = this.maxPrice();

    if (this.selectedFuels().length > 0) {
      const fuelMap: any = {
        'Flex': 'FLEX',
        'Gasolina': 'GASOLINE',
        'Eletric': 'ELECTRIC',
        'Elétrico': 'ELECTRIC',
        'Electric': 'ELECTRIC',
        'Hybrid': 'HYBRID',
        'Híbrido': 'HYBRID',
        'Diesel': 'DIESEL'
      };
      filters.fuelType = fuelMap[this.selectedFuels()[0]] || this.selectedFuels()[0].toUpperCase();
    }
    if (this.selectedTrans().length > 0) {
      const transMap: any = {
        'Automatic': 'AUTOMATIC',
        'Automático': 'AUTOMATIC',
        'Manual': 'MANUAL'
      };
      filters.transmission = transMap[this.selectedTrans()[0]] || this.selectedTrans()[0].toUpperCase();
    }

    // Location Filter
    const loc = this.carService.selectedLocation();
    if (loc && loc !== 'Todos') {
      const parts = loc.split(', ');
      if (parts.length === 2) {
        filters.city = parts[0];
        filters.state = parts[1];
      }
    }

    this.carService.getCars(filters).subscribe({
      next: (res) => {
        this.vehicles.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
    if (!q) {
      this.loadCars();
    } else {
      this.isLoading.set(true);
      this.carService.search(q).subscribe(res => {
        this.vehicles.set(res);
        this.totalElements.set(res.length);
        this.totalPages.set(1);
        this.isLoading.set(false);
      });
    }
  }

  private searchTimeout: any;

  onSearchInput() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.onSearch(this.searchQuery());
    }, 300);
  }

  onSearchEnter() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.onSearch(this.searchQuery());
  }

  clearSearch() {
    this.searchQuery.set('');
    this.onSearch('');
  }

  setPage(page: number) {
    this.currentPage.set(page);
    this.loadCars();
    // Scroll to the grid area, not top of page
    setTimeout(() => {
      const gridEl = document.querySelector('.content-zone');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  activeFilters = computed(() => {
    const filters: ActiveFilter[] = [];
    if (this.testDrive()) filters.push({ id: 'td', label: 'Free Test Drive', category: 'testDrive' });
    if (this.carType() !== 'all') filters.push({ id: 'ct', label: this.carType() === 'new' ? 'Novo' : 'Seminovo', category: 'carType' });
    this.selectedBrands().forEach(b => filters.push({ id: `b-${b}`, label: b, category: 'brand' }));
    if (this.minPrice() > 0 || this.maxPrice() < 1000) filters.push({ id: 'pr', label: `R$ \${this.minPrice()} - R$ \${this.maxPrice()}`, category: 'price' });
    this.selectedFuels().forEach(f => filters.push({ id: `f-${f}`, label: f, category: 'fuel' }));
    this.selectedTrans().forEach(t => filters.push({ id: `t-${t}`, label: t, category: 'trans' }));
    return filters;
  });

  removeFilter(f: ActiveFilter) {
    if (f.category === 'testDrive') this.testDrive.set(false);
    if (f.category === 'carType') this.carType.set('all');
    if (f.category === 'brand') {
      const bName = f.id.replace('b-', '');
      this.selectedBrands.update(bs => bs.filter(b => b !== bName));
    }
    if (f.category === 'price') { this.minPrice.set(0); this.maxPrice.set(1000); }
    if (f.category === 'fuel') {
      const fName = f.id.replace('f-', '');
      this.selectedFuels.update(fs => fs.filter(val => val !== fName));
    }
    if (f.category === 'trans') {
      const tName = f.id.replace('t-', '');
      this.selectedTrans.update(ts => ts.filter(val => val !== tName));
    }
    this.loadCars();
  }

  resetAllFilters() {
    this.testDrive.set(false);
    this.carType.set('all');
    this.selectedBrands.set([]);
    this.minPrice.set(0);
    this.maxPrice.set(1000);
    this.selectedFuels.set([]);
    this.selectedTrans.set([]);
    this.searchQuery.set('');
    this.loadCars();
  }
}
