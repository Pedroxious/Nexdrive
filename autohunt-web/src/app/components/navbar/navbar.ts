import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule, Car, MapPin, ChevronDown, Bell, PlusCircle, Sun, Moon, Menu, X, User, LogOut, Heart, CalendarDays, LogIn, Check } from 'lucide-angular';
import { AuthService } from '../../core/services/auth';
import { ThemeService } from '../../core/services/theme';
import { CarService } from '../../core/services/car';

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
            <a routerLink="/" class="nav-link">Início</a>
            <a routerLink="/rent" class="nav-link">Alugar</a>
            <a routerLink="/buy" class="nav-link">Comprar</a>
            <a routerLink="/about" class="nav-link">Sobre</a>
          </div>
        </div>

        <!-- Center: Location Selector -->
        <div class="nav-center">
          <div class="location-btn clickable" (click)="toggleLocations($event)">
            <lucide-icon name="map-pin" class="loc-icon" [size]="18"></lucide-icon>
            <span class="loc-text">{{ carService.selectedLocation() === 'Todos' ? 'Todas as cidades' : carService.selectedLocation() }}</span>
            <lucide-icon name="chevron-down" class="chevron" [size]="16"></lucide-icon>
          </div>
          <div class="loc-dropdown" *ngIf="showLocations()" (click)="$event.stopPropagation()">
            <div class="dropdown-header">Selecione a cidade</div>
            @for (city of cities; track city) {
              <div class="loc-item clickable"
                   [class.active]="carService.selectedLocation() === city"
                   (click)="selectCity(city, $event)">
                <lucide-icon name="check" [size]="16" *ngIf="carService.selectedLocation() === city"></lucide-icon>
                {{ city === 'Todos' ? 'Todas as cidades' : city }}
              </div>
            }
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="nav-right">
          <!-- Theme Toggle -->
          <button class="icon-btn clickable" (click)="theme.toggleTheme()" title="Alternar tema">
            <lucide-icon [name]="theme.theme() === 'light' ? 'moon' : 'sun'" [size]="20"></lucide-icon>
          </button>

          <!-- Notifications -->
          <div class="notif-wrap">
            <button class="icon-btn clickable" (click)="toggleNotifs($event)">
              <lucide-icon name="bell" [size]="20"></lucide-icon>
              <span class="badge" *ngIf="notifCount() > 0">{{ notifCount() }}</span>
            </button>
            <div class="dropdown-panel notif-dropdown" *ngIf="showNotif()">
              <div class="dropdown-header">Notificações</div>
              <div class="notif-list">
                <div class="notif-item">
                  <lucide-icon name="check" [size]="16" class="notif-icon success"></lucide-icon>
                  <span>Sua reserva para o Onix foi confirmada!</span>
                </div>
                <div class="notif-item">
                  <lucide-icon name="bell" [size]="16" class="notif-icon"></lucide-icon>
                  <span>Novo Tesla Model 3 disponível em SP.</span>
                </div>
              </div>
              <div class="dropdown-footer clickable">Ver todas</div>
            </div>
          </div>

          <!-- Sell CTA -->
          <a routerLink="/sell-car" class="sell-btn clickable">
            <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
            <span class="sell-text">Anunciar</span>
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
                    <lucide-icon name="user" [size]="16"></lucide-icon> Meu Perfil
                  </a>
                  <a routerLink="/my-rentals" class="drop-item clickable">
                    <lucide-icon name="calendar-days" [size]="16"></lucide-icon> Minhas Reservas
                  </a>
                  <a routerLink="/favorites" class="drop-item clickable">
                    <lucide-icon name="heart" [size]="16"></lucide-icon> Favoritos
                  </a>
                  <div class="dropdown-divider"></div>
                  <button class="drop-item logout clickable" (click)="auth.logout()">
                    <lucide-icon name="log-out" [size]="16"></lucide-icon> Sair
                  </button>
                </div>
              </div>
            } @else {
              <button class="login-btn clickable" routerLink="/login">
                <lucide-icon name="log-in" [size]="18"></lucide-icon>
                <span>Entrar</span>
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
        <a routerLink="/" class="mobile-link" (click)="mobileOpen.set(false)">Início</a>
        <a routerLink="/rent" class="mobile-link" (click)="mobileOpen.set(false)">Alugar</a>
        <a routerLink="/buy" class="mobile-link" (click)="mobileOpen.set(false)">Comprar</a>
        <a routerLink="/sell-car" class="mobile-link" (click)="mobileOpen.set(false)">Anunciar</a>
        <a routerLink="/about" class="mobile-link" (click)="mobileOpen.set(false)">Sobre</a>
        <a routerLink="/faq" class="mobile-link" (click)="mobileOpen.set(false)">FAQ</a>
        <a routerLink="/contact" class="mobile-link" (click)="mobileOpen.set(false)">Contato</a>
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

    .notif-dropdown { width: 320px; }
    .notif-list { max-height: 280px; overflow-y: auto; }
    .notif-item {
      padding: 14px 16px; font-size: 13px; color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
      display: flex; align-items: flex-start; gap: 10px; line-height: 1.4;
    }
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
export class NavbarComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  carService = inject(CarService);
  private eRef = inject(ElementRef);

  showLocations = signal(false);
  showNotif = signal(false);
  showProfile = signal(false);
  notifCount = signal(2);
  mobileOpen = signal(false);

  cities = [
    'Todos',
    'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
    'Brasília, DF', 'Curitiba, PR', 'Salvador, BA',
    'Fortaleza, CE', 'Recife, PE', 'Manaus, AM',
    'Porto Alegre, RS', 'Goiânia, GO', 'Belém, PA'
  ];

  toggleLocations(e: Event) { e.stopPropagation(); this.showLocations.update(v => !v); this.showNotif.set(false); this.showProfile.set(false); }
  toggleNotifs(e: Event) { e.stopPropagation(); this.showNotif.update(v => !v); this.showLocations.set(false); this.showProfile.set(false); }
  toggleProfile(e: Event) { e.stopPropagation(); this.showProfile.update(v => !v); this.showLocations.set(false); this.showNotif.set(false); }

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
    }
  }
}
