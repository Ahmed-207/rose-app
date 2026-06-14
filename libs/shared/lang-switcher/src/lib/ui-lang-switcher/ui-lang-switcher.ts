import { Component, computed, inject, Renderer2 } from '@angular/core';
import { LangService } from '../lang-service';
import { Language } from '../language';

@Component({
  selector: 'lib-ui-lang-switcher',
  imports: [],
  templateUrl: './ui-lang-switcher.html',
  styleUrl: './ui-lang-switcher.css',
})
export class UiLangSwitcher {

  private readonly langService = inject(LangService);
  private readonly renderer = inject(Renderer2);

  desiredLanguage = computed<Language>(() => this.langService.desiredLang());
  currentLanguage = computed<Language>(() => this.langService.currentLang());

  changeLanguage(): void {
    this.langService.changeLang();
    if (this.currentLanguage().code === 'ar') {
      this.renderer.setAttribute(document.documentElement, 'lang', 'ar');
      this.renderer.setAttribute(document.documentElement, 'dir', 'rtl');
    } else {
      this.renderer.setAttribute(document.documentElement, 'lang', 'en');
      this.renderer.setAttribute(document.documentElement, 'dir', 'ltr');
    }
  }


}
