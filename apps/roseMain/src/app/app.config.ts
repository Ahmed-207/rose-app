import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideTranslateService, TranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { authInterceptor, errorInterceptor, provideAuth } from '@org/auth';
import { environment } from '../environments/environment';
import { LangService } from '@org/ui-lang-switcher';
import { providePrimeNGTheme } from '@org/shared-theme';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { addressInterceptor } from '@org/user-addresses';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNGTheme(),
    provideAuth({ apiUrl: environment.apiUrl }),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: `${environment.shellUrl}/assets/i18n/`,
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
    provideAppInitializer(() => {
      const langService = inject(LangService);
      const translateService = inject(TranslateService);
      langService.init();

      const savedLang = localStorage.getItem('appLang') ?? 'en';
      if (translateService.currentLang() !== savedLang) {
        translateService.use(savedLang);
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('app-language-change', (event: Event) => {
          const lang = (event as CustomEvent<string>).detail;
          if (lang && translateService.currentLang() !== lang) {
            translateService.use(lang);
          }
        });
      }
    }),
    provideHttpClient(withInterceptors([addressInterceptor, authInterceptor]))
  ]
};
