import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast';
import { LanguageService } from './language';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class BehaviorTrackingService {
  private toast = inject(ToastService);
  private lang = inject(LanguageService);
  private auth = inject(AuthService);

  private readonly STORAGE_KEY = 'nexdrive_behavior';
  private detailTimer: any = null;

  /**
   * Get behavior data from sessionStorage (non-blocking)
   */
  private getData(): Record<string, any> {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveData(data: Record<string, any>): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore quota errors */ }
  }

  /**
   * Track when user views a vehicle card/listing (called from rent/buy pages)
   * Non-blocking: uses setTimeout to avoid interfering with navigation
   */
  trackVehicleListView(): void {
    setTimeout(() => {
      const data = this.getData();
      const count = (data['listViewCount'] || 0) + 1;
      data['listViewCount'] = count;
      this.saveData(data);

      // After viewing 5 vehicles in listing, suggest booking (once per session)
      if (count === 5 && !data['suggestedBooking']) {
        data['suggestedBooking'] = true;
        this.saveData(data);
        this.toast.info(this.lang.t('behavior.vehicles_browsed').replace('{count}', '' + count));
      }

      // After viewing 8 vehicles without login, suggest signup (once per session)
      if (count === 8 && !this.auth.isLoggedIn() && !data['suggestedSignup']) {
        data['suggestedSignup'] = true;
        this.saveData(data);
        setTimeout(() => {
          this.toast.info(this.lang.t('behavior.signup_after_views'));
        }, 3000);
      }
    }, 0);
  }

  /**
   * Track when user enters a vehicle detail page
   * Shows a contextual suggestion after 45 seconds on the same page
   */
  trackDetailPageEnter(vehicleId: number): void {
    this.clearDetailTimer();

    // Record this vehicle as viewed in localStorage for returning visitors
    setTimeout(() => {
      try {
        const viewed = JSON.parse(localStorage.getItem('nexdrive_recent_views') || '[]');
        const filtered = viewed.filter((v: any) => v.id !== vehicleId).slice(0, 9);
        filtered.unshift({ id: vehicleId, ts: Date.now() });
        localStorage.setItem('nexdrive_recent_views', JSON.stringify(filtered));
      } catch { /* ignore */ }
    }, 0);

    // After 45s on detail page, show contextual toast (once per vehicle per session)
    this.detailTimer = setTimeout(() => {
      const data = this.getData();
      const key = 'detailToast_' + vehicleId;
      if (!data[key]) {
        data[key] = true;
        this.saveData(data);
        this.toast.info(this.lang.t('behavior.time_on_detail'));
      }
    }, 45000);
  }

  /**
   * Clear detail page timer when user navigates away
   */
  trackDetailPageLeave(): void {
    this.clearDetailTimer();
  }

  private clearDetailTimer(): void {
    if (this.detailTimer) {
      clearTimeout(this.detailTimer);
      this.detailTimer = null;
    }
  }

  /**
   * Check if returning visitor and show relevant toast (called from AppComponent)
   * Only for non-logged visitors who have viewed vehicles before
   */
  checkReturningVisitor(): void {
    setTimeout(() => {
      if (this.auth.isLoggedIn()) return;

      const data = this.getData();
      if (data['returningChecked']) return;

      try {
        const viewed = JSON.parse(localStorage.getItem('nexdrive_recent_views') || '[]');
        if (viewed.length >= 3) {
          data['returningChecked'] = true;
          this.saveData(data);
          setTimeout(() => {
            this.toast.info(this.lang.t('behavior.returning_visitor'));
          }, 5000);
        }
      } catch { /* ignore */ }
    }, 2000);
  }

  /**
   * Detect user idle on any page and show suggestion
   * Non-blocking: sets up passive event listeners
   */
  setupIdleDetection(): void {
    let idleTimer: any = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const data = this.getData();
        if (!data['idleSuggested']) {
          data['idleSuggested'] = true;
          this.saveData(data);
          this.toast.info(this.lang.t('behavior.idle_suggestion'));
        }
      }, 120000); // 2 minutes idle
    };

    // Passive listeners - zero impact on scroll/interaction performance
    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdle, { passive: true });
    });
    resetIdle();
  }
}
