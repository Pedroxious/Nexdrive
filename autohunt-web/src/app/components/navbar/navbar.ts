import { Component, inject, signal, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule, Car, MapPin, ChevronDown, Bell, PlusCircle, Sun, Moon, Menu, X, User, LogOut, Heart, CalendarDays, LogIn, Check } from 'lucide-angular';
import { AuthService } from '../../core/services/auth';
import { ThemeService } from '../../core/services/theme';
import { CarService } from '../../core/services/car';
import { LanguageService } from '../../core/services/language';
import { NotificationService, AppNotification } from '../../core/services/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <!-- Left: Logo -->
        <div class="nav-left">
          <div class="logo clickable" routerLink="/">
            <img class="logo-favicon" src="favicon/favicon-32x32.png" alt="Nexdrive logo" width="32" height="32" />
            <span class="logo-text">Nex<span class="logo-accent">drive</span></span>
          </div>

          <!-- Nav Links (Desktop) -->
          <div class="nav-links">
            <a routerLink="/" class="nav-link">{{ langService.t('nav.home') }}</a>
            <a routerLink="/rent" class="nav-link">{{ langService.t('nav.rent') }}</a>
            <a routerLink="/buy" class="nav-link">{{ langService.t('nav.buy') }}</a>
            <a routerLink="/about" class="nav-link">{{ langService.t('nav.about') }}</a>
          </div>
        </div>

        <!-- Center: Location Selector -->
        <div class="nav-center">
          <div class="location-btn clickable" (click)="toggleLocations($event)">
            <lucide-icon name="map-pin" class="loc-icon" [size]="18"></lucide-icon>
            <span class="loc-text">{{ carService.selectedLocation() === 'Todos' ? langService.t('nav.all_cities') : carService.selectedLocation() }}</span>
            <lucide-icon name="chevron-down" class="chevron" [size]="16"></lucide-icon>
          </div>
          <div class="loc-dropdown" *ngIf="showLocations()" (click)="$event.stopPropagation()">
            <div class="dropdown-header">{{ langService.t('nav.select_city') }}</div>
            @for (city of cities; track city) {
              <div class="loc-item clickable"
                   [class.active]="carService.selectedLocation() === city"
                   (click)="selectCity(city, $event)">
                <lucide-icon name="check" [size]="16" *ngIf="carService.selectedLocation() === city"></lucide-icon>
                {{ city === 'Todos' ? langService.t('nav.all_cities') : city }}
              </div>
            }
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="nav-right">
          <!-- Language Selector Dropdown (Amazon / SaaS Premium Style) -->
          <div class="lang-selector-wrap">
            <button class="lang-trigger clickable" (click)="toggleLangDropdown($event)" [title]="langService.t('nav.language')">
              <span class="flag-icon">{{ langService.currentLang() === 'pt' ? '🇧🇷' : '🇺🇸' }}</span>
              <lucide-icon name="chevron-down" class="chevron" [size]="14" [class.open]="showLangDropdown()"></lucide-icon>
            </button>

            <div class="dropdown-panel lang-dropdown" *ngIf="showLangDropdown()" (click)="$event.stopPropagation()">
              <div class="lang-option clickable" [class.active]="langService.currentLang() === 'pt'" (click)="selectLanguage('pt', $event)">
                <span class="flag">🇧🇷</span>
                <span class="lang-name">Português (BR)</span>
                <lucide-icon name="check" [size]="14" class="check-mark" *ngIf="langService.currentLang() === 'pt'"></lucide-icon>
              </div>
              <div class="lang-option clickable" [class.active]="langService.currentLang() === 'en'" (click)="selectLanguage('en', $event)">
                <span class="flag">🇺🇸</span>
                <span class="lang-name">English (US)</span>
                <lucide-icon name="check" [size]="14" class="check-mark" *ngIf="langService.currentLang() === 'en'"></lucide-icon>
              </div>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button class="icon-btn clickable" (click)="theme.toggleTheme()" [title]="langService.t('nav.toggle_theme')">
            <lucide-icon [name]="theme.theme() === 'light' ? 'moon' : 'sun'" [size]="20"></lucide-icon>
          </button>

          <!-- Notifications -->
          <div class="notif-wrap">
            <button class="icon-btn clickable" (click)="toggleNotifs($event)">
              <lucide-icon name="bell" [size]="20"></lucide-icon>
              <span class="badge" *ngIf="notifService.unreadCount() > 0">{{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}</span>
            </button>
            <div class="dropdown-panel notif-dropdown" *ngIf="showNotif()" (click)="$event.stopPropagation()">
              <div class="dropdown-header notif-header">
                <span>{{ langService.t('nav.notifications') }}</span>
                <button class="mark-all-btn clickable" *ngIf="notifService.unreadCount() > 0" (click)="notifService.markAllRead()">{{ langService.t('nav.mark_all_read') }}</button>
              </div>
              <div class="notif-list">
                @if (notifService.notifications().length === 0) {
                  <div class="notif-empty">{{ langService.t('nav.no_notifications') }}</div>
                } @else {
                  @for (n of notifService.notifications(); track n.id) {
                    <div class="notif-item clickable" [class.unread]="!n.read" (click)="onNotifClick(n)">
                      <div class="notif-dot" *ngIf="!n.read"></div>
                      <div class="notif-content">
                        <div class="notif-title">{{ n.title }}</div>
                        <div class="notif-msg">{{ n.message }}</div>
                        <div class="notif-time">{{ timeAgo(n.createdAt) }}</div>
                      </div>
                    </div>
                  }
                }
              </div>
              <div class="dropdown-footer clickable" routerLink="/notifications" (click)="showNotif.set(false)">{{ langService.t('nav.view_all') }}</div>
            </div>
          </div>

          <!-- Sell CTA -->
          <a routerLink="/sell-car" class="sell-btn clickable">
            <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
            <span class="sell-text">{{ langService.t('nav.sell_car') }}</span>
          </a>

          <!-- Profile / Auth -->
          <div class="auth-wrap">
            @if (auth.isLoggedIn()) {
              <div class="profile-trigger clickable" (click)="toggleProfile($event)">
                <img [src]="auth.currentUser()?.profileImageUrl || 'https://ui-avatars.com/api/?name=' + auth.currentUser()?.fullName + '&background=00BFEA&color=fff'" class="avatar">
                <div class="profile-dropdown dropdown-panel" *ngIf="showProfile()">
                  <div class="user-info">
                    <strong>{{ auth.currentUser()?.fullName }}</strong>
                    <span>{{ auth.currentUser()?.email }}</span>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profile" class="drop-item clickable">
                    <lucide-icon name="user" [size]="16"></lucide-icon> {{ langService.t('nav.profile') }}
                  </a>
                  <a routerLink="/my-rentals" class="drop-item clickable">
                    <lucide-icon name="calendar-days" [size]="16"></lucide-icon> {{ langService.t('nav.my_rentals') }}
                  </a>
                  <a routerLink="/favorites" class="drop-item clickable">
                    <lucide-icon name="heart" [size]="16"></lucide-icon> {{ langService.t('nav.favorites') }}
                  </a>
                  <div class="dropdown-divider"></div>
                  <button class="drop-item logout clickable" (click)="auth.logout()">
                    <lucide-icon name="log-out" [size]="16"></lucide-icon> {{ langService.t('nav.logout') }}
                  </button>
                </div>
              </div>
            } @else {
              <button class="login-btn clickable" routerLink="/login">
                <lucide-icon name="log-in" [size]="18"></lucide-icon>
                <span>{{ langService.t('nav.login') }}</span>
              </button>
            }
          </div>

          <!-- Mobile Menu -->
          <button class="mobile-menu-btn clickable" (click)="mobileOpen.set(!mobileOpen())">
            <lucide-icon [name]="mobileOpen() ? 'x' : 'menu'" [size]="24"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Panel -->
      <div class="mobile-panel" *ngIf="mobileOpen()">
        <a routerLink="/" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.home') }}</a>
        <a routerLink="/rent" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.rent') }}</a>
        <a routerLink="/buy" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.buy') }}</a>
        <a routerLink="/sell-car" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.sell_car') }}</a>
        <a routerLink="/about" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.about') }}</a>
        <a routerLink="/faq" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.faq') }}</a>
        <a routerLink="/contact" class="mobile-link" (click)="mobileOpen.set(false)">{{ langService.t('nav.contact') }}</a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--bg-navbar);
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.35);
    }

    .nav-container {
      max-width: var(--max-width);
      margin: 0 auto;
      height: var(--navbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
    }

    /* ── Left ── */
    .nav-left { display: flex; align-items: center; gap: 32px; }

    .logo {
      display: flex; align-items: center; gap: 10px;
    }
    .logo-favicon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 8px rgba(0, 191, 234, 0.40));
      transition: filter 0.2s, transform 0.2s;
      &:hover { filter: drop-shadow(0 4px 16px rgba(0, 191, 234, 0.55)); transform: scale(1.05); }
    }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 26px; font-weight: 900; letter-spacing: -0.8px;
      color: #FFFFFF;
    }
    .logo-accent { color: var(--accent); }

    .nav-links {
      display: flex; align-items: center; gap: 2px;
    }
    .nav-link {
      padding: 8px 14px; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.70);
      transition: all 0.2s;
      &:hover { color: #fff; background: rgba(255,255,255,0.08); }
    }

    /* ── Center ── */
    .nav-center { position: relative; }

    .location-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: var(--radius-full);
      border: 1.5px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.06);
      transition: all 0.2s;
      &:hover { border-color: var(--accent); background: rgba(0,191,234,0.08); }
    }
    .loc-icon { color: var(--accent); flex-shrink: 0; }
    .loc-text { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chevron { color: rgba(255,255,255,0.40); flex-shrink: 0; }

    .loc-dropdown {
      position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
      width: 260px; background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
      z-index: 1010; overflow: hidden;
      animation: slideDown 0.2s ease-out;
    }

    .dropdown-header {
      padding: 12px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }

    .loc-item {
      padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--text-secondary);
      display: flex; align-items: center; gap: 8px;
      transition: all 0.15s;
      &:hover { background: var(--surface-hover); color: var(--text-primary); }
      &.active { color: var(--accent); font-weight: 700; background: var(--accent-light); }
      lucide-icon { width: 16px; height: 16px; }
    }

    /* ── Right ── */
    .nav-right { display: flex; align-items: center; gap: 8px; }

    .icon-btn {
      width: 40px; height: 40px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      position: relative; color: rgba(255,255,255,0.60);
      transition: all 0.2s;
      &:hover { background: rgba(0,191,234,0.12); color: var(--accent); }
    }

    /* ── Amazon-style Premium Language Dropdown ── */
    .lang-selector-wrap { position: relative; }

    .lang-trigger {
      display: flex; align-items: center; gap: 4px;
      padding: 7px 10px; border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(0, 191, 234, 0.14);
        border-color: rgba(0, 191, 234, 0.40);
        color: var(--accent);
      }

      .flag-icon { font-size: 16px; line-height: 1; }
      .chevron {
        color: rgba(255,255,255,0.50);
        transition: transform 0.2s ease;
        &.open { transform: rotate(180deg); color: var(--accent); }
      }
    }

    .lang-dropdown {
      min-width: 165px;
      padding: 6px;
      top: calc(100% + 8px);
      right: 0;
    }

    .lang-option {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; border-radius: 6px;
      font-size: 13px; font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.15s ease;

      .flag { font-size: 16px; }
      .lang-name { flex: 1; font-family: 'Inter', sans-serif; }
      .check-mark { color: var(--accent); }

      &:hover {
        background: var(--surface-secondary);
        color: var(--text-primary);
      }
      &.active {
        background: rgba(0, 191, 234, 0.12);
        color: var(--accent);
        font-weight: 600;
      }
    }

    .badge {
      position: absolute; top: 4px; right: 4px;
      background: var(--error); color: #fff;
      width: 16px; height: 16px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 800;
      border: 2px solid var(--bg-navbar);
    }

    .sell-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 20px; border-radius: 8px;
      border: none;
      background: #00BFFF; color: #0A1628; font-size: 13px; font-weight: 600;
      transition: all 0.2s;
      &:hover { background: #00AADD; box-shadow: 0 4px 16px rgba(0,191,234,0.30); }
    }

    .notif-wrap { position: relative; }

    .dropdown-panel {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
      z-index: 1010; overflow: hidden;
      animation: slideDown 0.2s ease-out;
    }

    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .mark-all-btn {
      background: none; border: none; color: var(--accent); font-size: 11px;
      font-weight: 700; cursor: pointer; padding: 2px 6px; border-radius: 4px;
      transition: background 0.15s;
      &:hover { background: rgba(0,191,234,0.12); }
    }
    .notif-dropdown { width: 360px; }
    .notif-list { max-height: 320px; overflow-y: auto; }
    .notif-empty {
      padding: 32px 16px; text-align: center; font-size: 13px;
      color: var(--text-muted);
    }
    .notif-item {
      padding: 12px 16px; font-size: 13px; color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
      display: flex; align-items: flex-start; gap: 10px; line-height: 1.4;
      transition: background 0.15s;
      &:hover { background: var(--surface-hover); }
      &.unread { background: rgba(0,191,234,0.04); }
    }
    .notif-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
      flex-shrink: 0; margin-top: 5px;
    }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 2px; }
    .notif-msg { font-size: 12px; color: var(--text-secondary); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .notif-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .notif-icon { color: var(--accent); flex-shrink: 0; margin-top: 1px; }
    .notif-icon.success { color: var(--success); }
    .dropdown-footer {
      padding: 12px 16px; text-align: center;
      font-size: 13px; font-weight: 700; color: var(--accent);
      border-top: 1px solid var(--border);
      &:hover { background: var(--accent-light); }
    }

    .dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }

    /* ── Auth ── */
    .auth-wrap { position: relative; }
    .avatar {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      object-fit: cover; border: 2px solid rgba(0,191,234,0.35);
      transition: border-color 0.2s;
      &:hover { border-color: var(--accent); }
    }

    .profile-dropdown {
      width: 240px; padding: 8px;
    }
    .user-info {
      padding: 12px 8px; display: flex; flex-direction: column;
      strong { font-size: 14px; font-weight: 700; }
      span { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    }
    .drop-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 8px; font-size: 14px; font-weight: 600;
      border-radius: var(--radius-sm); transition: all 0.15s;
      color: var(--text-secondary); text-align: left; width: 100%;
      &:hover { background: var(--surface-hover); color: var(--text-primary); }
    }
    .logout {
      color: var(--error);
      &:hover { background: rgba(239, 68, 68, 0.08); color: var(--error); }
    }

    .login-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 22px; border-radius: var(--radius-full);
      background: var(--accent); color: #fff;
      font-size: 14px; font-weight: 700;
      transition: all 0.2s;
      &:hover { background: var(--accent-hover); box-shadow: 0 4px 16px rgba(0,191,234,0.35); }
    }

    .mobile-menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 0;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      &:hover { background: rgba(255,255,255,0.10); }
    }

    /* ── Mobile ── */
    @media (max-width: 900px) {
      .nav-links, .nav-center, .sell-btn { display: none; }
      .mobile-menu-btn { display: flex; }
      .nav-container { gap: 8px; }
      .nav-right { gap: 4px; }
    }
    @media (max-width: 600px) {
      .nav-container { padding: 0 12px; height: 56px; gap: 6px; }
      .sell-text { display: none; }
      .logo-favicon { width: 26px; height: 26px; border-radius: 7px; }
      .logo-text { font-size: 20px; letter-spacing: -0.5px; }
      .logo { gap: 7px; }
      .nav-right { gap: 2px; }
      .icon-btn { width: 34px; height: 34px; }
      .login-btn { padding: 7px 14px; font-size: 12px; gap: 4px; }
      .mobile-menu-btn { width: 34px; height: 34px; }
      .notif-dropdown { width: 280px; right: -40px; }
      .badge { width: 14px; height: 14px; font-size: 8px; top: 2px; right: 2px; }
    }
    @media (max-width: 380px) {
      .nav-container { padding: 0 10px; }
      .logo-favicon { width: 24px; height: 24px; }
      .logo-text { font-size: 18px; }
      .login-btn { padding: 6px 12px; font-size: 11px; }
      .icon-btn { width: 32px; height: 32px; }
      .mobile-menu-btn { width: 32px; height: 32px; }
    }

    .mobile-panel {
      display: none;
      padding: 8px 16px 16px;
      border-top: 1px solid rgba(255,255,255,0.07);
      background: var(--bg-navbar);
      animation: slideDown 0.2s ease-out;
    }
    @media (max-width: 900px) {
      .mobile-panel { display: flex; flex-direction: column; }
    }
    .mobile-link {
      padding: 14px 12px; font-size: 15px; font-weight: 600;
      color: rgba(255,255,255,0.70); border-radius: var(--radius-sm);
      transition: all 0.2s;
      &:hover { background: rgba(0,191,234,0.10); color: #fff; }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  carService = inject(CarService);
  langService = inject(LanguageService);
  notifService = inject(NotificationService);
  private eRef = inject(ElementRef);
  private pollingInterval: any = null;

  showLocations = signal(false);
  showNotif = signal(false);
  showProfile = signal(false);
  showLangDropdown = signal(false);
  mobileOpen = signal(false);

  cities = [
    'Todos',
    'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
    'Brasília, DF', 'Curitiba, PR', 'Salvador, BA',
    'Fortaleza, CE', 'Recife, PE', 'Manaus, AM',
    'Porto Alegre, RS', 'Goiânia, GO', 'Belém, PA'
  ];

  toggleLocations(e: Event) { e.stopPropagation(); this.showLocations.update(v => !v); this.showNotif.set(false); this.showProfile.set(false); this.showLangDropdown.set(false); }
  toggleNotifs(e: Event) { e.stopPropagation(); this.showNotif.update(v => !v); this.showLocations.set(false); this.showProfile.set(false); this.showLangDropdown.set(false); }
  toggleProfile(e: Event) { e.stopPropagation(); this.showProfile.update(v => !v); this.showLocations.set(false); this.showNotif.set(false); this.showLangDropdown.set(false); }
  toggleLangDropdown(e: Event) { e.stopPropagation(); this.showLangDropdown.update(v => !v); this.showLocations.set(false); this.showNotif.set(false); this.showProfile.set(false); }

  selectLanguage(lang: 'pt' | 'en', e: Event) {
    e.stopPropagation();
    this.langService.setLanguage(lang);
    this.showLangDropdown.set(false);
  }

  selectCity(city: string, e: Event) {
    e.stopPropagation();
    this.carService.selectedLocation.set(city);
    this.showLocations.set(false);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showLocations.set(false);
      this.showNotif.set(false);
      this.showProfile.set(false);
      this.showLangDropdown.set(false);
    }
  }

  // ETAPA 8: Polling every 30s for logged-in users
  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.notifService.fetchNotifications();
      this.pollingInterval = setInterval(() => {
        if (this.auth.isLoggedIn()) {
          this.notifService.fetchUnreadCount();
        }
      }, 30000);
    }
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  onNotifClick(n: AppNotification) {
    if (!n.read) {
      this.notifService.markAsRead(n.id);
    }
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return this.langService.currentLang() === 'pt' ? 'agora' : 'just now';
    if (diffMin < 60) return this.langService.currentLang() === 'pt' ? `${diffMin}min atras` : `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return this.langService.currentLang() === 'pt' ? `${diffH}h atras` : `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return this.langService.currentLang() === 'pt' ? `${diffD}d atras` : `${diffD}d ago`;
  }
}
