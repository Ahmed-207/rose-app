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
import { provideAppToast, toastErrorInterceptor } from '@org/shared-ui-components';
import { addressInterceptor } from '@org/user-addresses';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppToast(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNGTheme(),
    provideAuth({
      apiUrl: environment.apiUrl,
      extraInterceptors: [addressInterceptor, toastErrorInterceptor],
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
    }),
  ]
};
