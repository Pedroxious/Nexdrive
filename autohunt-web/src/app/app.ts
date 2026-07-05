import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { ToastComponent } from './components/toast/toast';

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
      min-height: calc(100vh - 72px - 340px); /* Adjust for nav and footer approx height */
    }
  `]
})
export class App { }
