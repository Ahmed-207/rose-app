import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { provideAuth } from '@org/auth';
import { environment } from '../environments/environment';
import { LangService } from '@org/ui-lang-switcher';
import { providePrimeNGTheme } from '@org/shared-theme';
import { toastErrorInterceptor } from '@org/shared-ui-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNGTheme(),
    provideAuth({
      apiUrl: environment.apiUrl,
      extraInterceptors: [toastErrorInterceptor],
    }),
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
      langService.init();
    })
  ]
};
