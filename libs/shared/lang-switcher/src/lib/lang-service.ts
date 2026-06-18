import { computed, inject, Injectable, signal, WritableSignal, RendererFactory2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from './language';

@Injectable({
  providedIn: 'root',
})
export class LangService {

  private readonly translateService = inject(TranslateService);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);

  currentLang: WritableSignal<Language> = signal<Language>(
    (localStorage.getItem('appLang') ?? this.translateService.getCurrentLang() ?? 'en') === 'ar'
      ? { name: 'العربية', code: 'ar' }
      : { name: 'English', code: 'en' }
  );

  desiredLang = computed<Language>(() =>
    this.currentLang().code === 'ar'
      ? { name: 'English', code: 'en' }
      : { name: 'العربية', code: 'ar' }
  );

  /** Sync TranslateService + <html> dir/lang with the current saved language. Call once at app bootstrap. */
  init(): void {
    const lang = this.currentLang();
    this.translateService.use(lang.code);
    this.applyDirection(lang.code);
  }

  changeLang(): void {
    if (this.currentLang().code === 'en') {
      this.useArLang();
    } else {
      this.useEnLang();
    }
  }

  useArLang(): void {
    this.translateService.use('ar');
    this.currentLang.set({ name: 'العربية', code: 'ar' });
    localStorage.setItem('appLang', 'ar');
    this.applyDirection('ar');
  }

  useEnLang(): void {
    this.translateService.use('en');
    this.currentLang.set({ name: 'English', code: 'en' });
    localStorage.setItem('appLang', 'en');
    this.applyDirection('en');
  }

  private applyDirection(langCode: string): void {
    this.renderer.setAttribute(document.documentElement, 'lang', langCode);
    this.renderer.setAttribute(document.documentElement, 'dir', langCode === 'ar' ? 'rtl' : 'ltr');
  }
}