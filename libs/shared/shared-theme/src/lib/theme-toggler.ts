import { LangService } from '@org/ui-lang-switcher';
import { Component, computed, inject, effect, signal, WritableSignal } from '@angular/core';
import { ThemeService } from './theme.service';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'lib-theme-toggler',
  imports: [RippleModule],
  templateUrl: './theme-toggler.html',
  styleUrl: './theme-toggler.css',
})
export class ThemeToggler {
  readonly theme = inject(ThemeService);
  private readonly translate = inject(LangService);

  // 1. Initialize local signal with the current signal value from the service
  readonly usedLang: WritableSignal<any> = signal(this.translate.currentLang());

  constructor() {
    // 2. The effect now properly executes the signal function to track changes dynamically
    effect(() => {
      // CRITICAL FIX: Added () to execute and track the service's signal reactively
      const activeLang = this.translate.currentLang();

      if (activeLang) {
        this.usedLang.set(activeLang);
      }
    });
  }

  // 3. This computed tracking utility will now immediately fire on changes
  readonly togglerClass = computed(() => {
    const isDark = this.theme.isDark();
    const isEn = this.usedLang()?.code === 'en'; // Changed to .code to match your service's object layout safely

    if (isDark) {
      return isEn ? 'translate-x-7 bg-gray-900' : '-translate-x-7 bg-gray-900';
    } else {
      return isEn ? 'translate-x-0.5 bg-white' : '-translate-x-0.5 bg-white';
    }
  });
}