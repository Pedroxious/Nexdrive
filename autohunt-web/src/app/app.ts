import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { ToastComponent } from './components/toast/toast';
import { ToastService } from './core/services/toast';
import { LanguageService } from './core/services/language';
import { AuthService } from './core/services/auth';
import { BehaviorTrackingService } from './core/services/behavior-tracking';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <app-navbar />
    <app-toast />
    <main class="page-container">
      <router-outlet />
    </main>
    <app-footer />
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
    // Welcome toast: first visit only (controlled by localStorage)
    const welcomeShown = localStorage.getItem('nexdrive_welcome_shown');
    if (!welcomeShown) {
      setTimeout(() => {
        this.toast.info(this.lang.t('visitor.welcome'));
        localStorage.setItem('nexdrive_welcome_shown', 'true');
      }, 1200);
    }

    // Signup incentive: shown once per session to non-logged visitors who return
    if (!this.auth.isLoggedIn()) {
      const signupShown = sessionStorage.getItem('nexdrive_signup_shown');
      if (welcomeShown && !signupShown) {
        setTimeout(() => {
          this.toast.info(this.lang.t('visitor.signup_incentive'));
          sessionStorage.setItem('nexdrive_signup_shown', 'true');
        }, 8000);
      }
    }

    // Non-blocking behavior tracking
    this.behavior.checkReturningVisitor();
    this.behavior.setupIdleDetection();
  }
}
