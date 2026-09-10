import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthErrorService } from '../services/auth-error.service';
import { AuthCookieStorage } from '../storage/auth-cookie-storage';
import { resolveAuthErrorMessage } from '../utils/resolve-auth-error-message';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authErrorService = inject(AuthErrorService);
  const authCookieStorage = inject(AuthCookieStorage);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        authErrorService.report(resolveAuthErrorMessage(error));

        if (error.status === 401 && !req.url.includes('/auth/login')) {
          authCookieStorage.removeSession();
          void router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
        } else if (error.status >= 500) {
          void router.navigate(['/500']);
        } else if (error.status === 403) {
          void router.navigate(['/unauthorized']);
        }
      }

      return throwError(() => error);
    }),
  );
};
