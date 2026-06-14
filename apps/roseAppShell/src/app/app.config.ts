import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { provideAppInitializer, inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: false || 'none' }
      }
    }),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: `${environment.shellUrl}/assets/i18n/`,
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const savedLang = localStorage.getItem('appLang') || 'en';
      translate.use(savedLang);
    })
  ]
};
