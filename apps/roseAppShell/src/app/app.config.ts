import { addressInterceptor } from "@org/user-addresses";
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
import { authInterceptor, provideAuth } from '@org/auth';
import { environment } from '../environments/environment';
import { LangService } from '@org/ui-lang-switcher';
import { providePrimeNGTheme } from '@org/shared-theme';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNGTheme(),
    provideAuth({ apiUrl: environment.apiUrl }),
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
    provideHttpClient(withInterceptors([addressInterceptor, authInterceptor])),
    // provideAnimationsAsync(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    })

  ]
};
function provideAnimationsAsync(): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error("Function not implemented.");
}

