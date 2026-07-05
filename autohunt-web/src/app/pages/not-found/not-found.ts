import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found animate-in">
      <div class="card glass">
        <span class="icon">🚗💨</span>
        <h1>404</h1>
        <h2>Ops! Esse caminho não existe.</h2>
        <p>Parece que o veículo que você procura mudou de rota ou a página foi removida.</p>
        <button class="home-btn clickable" routerLink="/">Voltar para a Home</button>
      </div>
    </div>
  `,
  styles: [`
    .not-found { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { padding: 60px; text-align: center; border-radius: var(--radius-lg); max-width: 500px; }
    .icon { font-size: 80px; display: block; margin-bottom: 20px; }
    h1 { font-size: 100px; font-weight: 900; color: var(--accent-blue); line-height: 1; margin-bottom: 10px; }
    h2 { font-size: 24px; font-weight: 800; margin-bottom: 15px; }
    p { color: var(--text-secondary); margin-bottom: 30px; font-size: 16px; }
    .home-btn { padding: 15px 30px; background: var(--accent-blue); color: white; border-radius: var(--radius-md); font-weight: 800; font-size: 16px; }
    .animate-in { animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } }
  `]
})
export class NotFoundComponent { }
