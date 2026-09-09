import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthErrorService } from '../services/auth-error.service';
import { resolveAuthErrorMessage } from '../utils/resolve-auth-error-message';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authErrorService = inject(AuthErrorService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        authErrorService.report(resolveAuthErrorMessage(error));

        if (error.status >= 500){
          router.navigate(['/500'])
        }
        else if (error.status === 403){
          router.navigate(['/unauthorized'])
        }
      }

      return throwError(() => error);
    }),
  );
};
