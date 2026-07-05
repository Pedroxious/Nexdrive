import { Component, model, signal, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, X } from 'lucide-angular';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="search-container">
      <lucide-icon name="search" [size]="20" class="search-icon"></lucide-icon>
      <input 
        type="text" 
        [(ngModel)]="searchQuery" 
        (input)="onInput()"
        (keydown.enter)="onEnter()"
        placeholder="Buscar por marca, modelo ou categoria..." 
        class="search-input"
      />
      @if (searchQuery()) {
        <button class="clear-btn clickable" (click)="clear()">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-container {
      display: flex; align-items: center;
      padding: 0 20px; height: 52px; width: 100%; max-width: 600px;
      margin: 0 auto;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-full);
      transition: all 0.25s ease;
      box-shadow: var(--shadow-xs);
      &:focus-within { 
        border-color: var(--accent); 
        box-shadow: 0 0 0 3px var(--accent-light), 0 4px 16px rgba(0, 191, 234, 0.10); 
      }
      &:hover:not(:focus-within) {
        border-color: var(--text-muted);
      }
    }
    .search-icon { color: var(--accent); margin-right: 12px; flex-shrink: 0; }
    .search-input {
      flex: 1; background: none; border: none; outline: none;
      font-size: 14px; font-weight: 500; color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      &::placeholder { color: var(--text-muted); }
    }
    .clear-btn {
      color: var(--text-muted); display: flex; padding: 4px;
      border-radius: 50%; transition: all 0.15s; flex-shrink: 0;
      &:hover { background: var(--surface-secondary); color: var(--text-secondary); }
    }
  `]
})
export class SearchBarComponent {
  searchQuery = model<string>('');
  searchChange = output<string>();

  private timeout: any;

  onInput() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.searchChange.emit(this.searchQuery());
    }, 300);
  }

  onEnter() {
    if (this.timeout) clearTimeout(this.timeout);
    this.searchChange.emit(this.searchQuery());
  }

  clear() {
    this.searchQuery.set('');
    this.searchChange.emit('');
  }
}
