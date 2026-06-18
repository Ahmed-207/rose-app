import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDark = signal<boolean>(this.mediaQuery.matches);

    constructor() {
        effect(() => {
            document.documentElement.classList.toggle('dark', this.isDark());
        });

        this.mediaQuery.addEventListener('change', (e) => {
            this.isDark.set(e.matches);
        });
    }
}