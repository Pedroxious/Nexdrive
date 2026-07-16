import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, MessageCircle, X, Mail } from 'lucide-angular';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { ToastService } from './core/services/toast';
import { AuthService } from './core/services/auth';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, LucideAngularModule],
    template: `
    <div class="app-wrapper">
      <app-navbar></app-navbar>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <!-- Floating Contact Button -->
      <div class="float-contact">
        <div class="contact-popup" *ngIf="showContactPopup()" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <span class="popup-title">Fale Conosco</span>
            <button class="popup-close clickable" (click)="showContactPopup.set(false)">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <p class="popup-desc">Escolha como prefere entrar em contato:</p>
          <div class="popup-actions">
            <a href="https://www.whatsapp.com/download" target="_blank" rel="noopener" class="contact-option whatsapp clickable">
              <span class="contact-icon-wrap whatsapp-bg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <div class="contact-text">
                <strong>WhatsApp</strong>
                <span>Baixar o aplicativo</span>
              </div>
            </a>
            <a href="mailto:pedroazevedojoel@gmail.com?subject=Contato%20Nexdrive&body=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20aluguel%20de%20veículos%20na%20Nexdrive." class="contact-option email clickable">
              <span class="contact-icon-wrap email-bg">
                <lucide-icon name="mail" [size]="20"></lucide-icon>
              </span>
              <div class="contact-text">
                <strong>E-mail</strong>
                <span>Enviar mensagem</span>
              </div>
            </a>
          </div>
        </div>
        <button class="float-btn clickable" (click)="toggleContactPopup($event)" [class.active]="showContactPopup()">
          <lucide-icon [name]="showContactPopup() ? 'x' : 'message-circle'" [size]="24"></lucide-icon>
        </button>
      </div>

      <!-- Global Toasts -->
      <div class="toast-container">
        <div *ngFor="let toast of toastService.toasts()" class="toast animate-in" [class]="toast.type">
          <span class="icon">{{ getIcon(toast.type) }}</span>
          <span class="message">{{ toast.message }}</span>
          <button class="close-toast-btn" (click)="toastService.remove(toast.message)">✕</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .app-wrapper {
      min-height: 100vh;
      background: var(--bg-main);
      display: flex;
      flex-direction: column;
    }
    .main-content {
      flex: 1 0 auto;
      padding: 0;
    }

    /* ═══════ FLOATING CONTACT BUTTON ═══════ */
    .float-contact {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 1500;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    .float-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00BFEA 0%, #0099C4 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 191, 234, 0.35);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: pulseGlow 2.5s ease-in-out infinite;
      border: none;

      &:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 28px rgba(0, 191, 234, 0.50);
      }

      &.active {
        background: linear-gradient(135deg, #1A3A6B 0%, #0E2550 100%);
        animation: none;
        transform: rotate(0deg);
      }
    }

    .contact-popup {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl), 0 0 40px rgba(0, 191, 234, 0.08);
      width: 320px;
      overflow: hidden;
      animation: popupSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes popupSlideUp {
      from { opacity: 0; transform: translateY(12px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 0;
    }

    .popup-title {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: var(--text-primary);
    }

    .popup-close {
      width: 32px; height: 32px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      transition: all 0.2s;
      &:hover { background: var(--surface-hover); color: var(--text-primary); }
    }

    .popup-desc {
      padding: 8px 20px 16px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .popup-actions {
      padding: 0 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .contact-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;

      &:hover {
        border-color: transparent;
        transform: translateX(4px);
      }

      &.whatsapp:hover {
        background: rgba(37, 211, 102, 0.08);
        border-color: rgba(37, 211, 102, 0.25);
      }
      &.email:hover {
        background: var(--accent-light);
        border-color: rgba(0, 191, 234, 0.25);
      }
    }

    .contact-icon-wrap {
      width: 40px; height: 40px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .whatsapp-bg { background: #25D366; }
    .email-bg { background: var(--accent); color: #fff; }

    .contact-text {
      display: flex; flex-direction: column;
      strong {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
      }
      span {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 1px;
      }
    }

    /* ═══════ TOAST CONTAINER ═══════ */
    .toast-container {
      position: fixed;
      bottom: 100px;
      right: 32px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      
      &.success { border-left: 4px solid var(--success); }
      &.error { border-left: 4px solid var(--error); }
      &.warning { border-left: 4px solid var(--warning); }
      &.info { border-left: 4px solid var(--info); }

      .icon { 
        font-size: 18px; 
        flex-shrink: 0;
      }
      .message { 
        flex: 1; 
        font-family: 'Inter', sans-serif;
        font-size: 13.5px; 
        font-weight: 600; 
        color: var(--text-primary); 
        line-height: 1.4;
      }
      .close-toast-btn { 
        font-size: 16px; 
        color: var(--text-muted); 
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        transition: color 0.2s;
        &:hover {
          color: var(--text-primary);
        }
      }
    }
    .animate-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideIn { 
      from { transform: translateX(100%); opacity: 0; } 
      to { transform: translateX(0); opacity: 1; } 
    }

    @media (max-width: 600px) {
      .float-contact {
        bottom: 20px;
        right: 20px;
      }
      .contact-popup {
        width: calc(100vw - 40px);
        max-width: 320px;
      }
      .float-btn {
        width: 52px;
        height: 52px;
      }
      .toast-container {
        left: 16px;
        right: 16px;
        bottom: 84px;
        max-width: none;
      }
      .toast {
        min-width: 0;
      }
    }
  `]
})
export class AppComponent implements OnInit {
    toastService  = inject(ToastService);
    private authService = inject(AuthService);
    showContactPopup = signal(false);

    ngOnInit() {
        // Restore session from httpOnly cookie on app startup.
        // If the cookie is valid, currentUser signal is populated.
        // If not, we stay in logged-out state silently.
        this.authService.restoreSession().subscribe();
    }

    getIcon(type: string) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }

    toggleContactPopup(e: Event) {
        e.stopPropagation();
        this.showContactPopup.update(v => !v);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        // Close popup when clicking outside
        this.showContactPopup.set(false);
    }

    @HostListener('document:contextmenu', ['$event'])
    onContextMenu(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
            event.preventDefault();
        }
    }

    @HostListener('document:dragstart', ['$event'])
    onDragStart(event: DragEvent) {
        const target = event.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
            event.preventDefault();
        }
    }
}
