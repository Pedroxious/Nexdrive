import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>(this.getInitialTheme());

  private getInitialTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('theme') as 'light' | 'dark';
        if (saved === 'light' || saved === 'dark') return saved;
      } catch {}
    }
    return 'light';
  }

  constructor() {
    effect(() => {
      const current = this.theme();
      if (typeof window !== 'undefined') {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme', current);
          }
          document.documentElement.setAttribute('data-theme', current);
        } catch {}
      }
    });
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
