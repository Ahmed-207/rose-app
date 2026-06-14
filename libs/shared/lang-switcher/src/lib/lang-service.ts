import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from './language';

@Injectable({
  providedIn: 'root',
})
export class LangService {

  private readonly translateService = inject(TranslateService);
  currentLang: WritableSignal<Language> = signal<Language>(
    (localStorage.getItem('appLang') ?? this.translateService.getCurrentLang() ?? 'en') === 'ar'
      ? { name: 'العربية', code: 'ar' }
      : { name: 'English', code: 'en' }
  );
  desiredLang = computed<Language>(() => this.currentLang().code === 'ar' ? { name: 'English', code: 'en' } : { name: 'العربية', code: 'ar' })


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
  }

  useEnLang(): void {
    this.translateService.use('en');
    this.currentLang.set({ name: 'English', code: 'en' });
    localStorage.setItem('appLang', 'en');
  }

}
