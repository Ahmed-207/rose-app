import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'rose-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  isDark = signal<boolean>(this._resolveInitialTheme());

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('dark', this.isDark());
    });


    this.mediaQuery.addEventListener('change', (e) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        this.isDark.set(e.matches);
      }
    });
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }


  resetToOS(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.isDark.set(this.mediaQuery.matches);
  }

  private _resolveInitialTheme(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return this.mediaQuery.matches; 
  }
}