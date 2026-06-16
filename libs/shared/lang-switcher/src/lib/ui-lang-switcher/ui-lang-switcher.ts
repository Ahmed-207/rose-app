import { Component, computed, inject } from '@angular/core';
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

  desiredLanguage = computed<Language>(() => this.langService.desiredLang());
  currentLanguage = computed<Language>(() => this.langService.currentLang());

  changeLanguage(): void {
    this.langService.changeLang();
  }
}