import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { ToastComponent } from './components/toast/toast';
import { ToastService } from './core/services/toast';
import { LanguageService } from './core/services/language';
import { AuthService } from './core/services/auth';
import { BehaviorTrackingService } from './core/services/behavior-tracking';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, CookieBannerComponent],
  template: `
    <app-navbar />
    <app-toast />
    <main class="page-container">
      <router-outlet />
    </main>
    <app-footer />
    <app-cookie-banner />
  `,
  styles: [`
    .page-container {
      min-height: calc(100vh - 72px - 340px);
    }
  `]
})
export class App implements OnInit {
  private toast = inject(ToastService);
  private lang = inject(LanguageService);
  private auth = inject(AuthService);
  private behavior = inject(BehaviorTrackingService);

  ngOnInit() {
    if (typeof window === 'undefined') return;

    let welcomeShown = false;
    if (typeof localStorage !== 'undefined') {
      welcomeShown = !!localStorage.getItem('nexdrive_welcome_shown');
      if (!welcomeShown) {
        setTimeout(() => {
          this.toast.info(this.lang.t('visitor.welcome'));
          try { localStorage.setItem('nexdrive_welcome_shown', 'true'); } catch {}
        }, 1200);
      }
    }

    if (!this.auth.isLoggedIn() && typeof sessionStorage !== 'undefined') {
      const signupShown = sessionStorage.getItem('nexdrive_signup_shown');
      if (welcomeShown && !signupShown) {
        setTimeout(() => {
          this.toast.info(this.lang.t('visitor.signup_discount'));
          try { sessionStorage.setItem('nexdrive_signup_shown', 'true'); } catch {}
        }, 8000);
      }
    }

    this.behavior.checkReturningVisitor();
    this.behavior.setupIdleDetection();
  }
}
