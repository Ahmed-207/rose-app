import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthErrorService } from '../services/auth-error.service';
import { resolveAuthErrorMessage } from '../utils/resolve-auth-error-message';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authErrorService = inject(AuthErrorService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        authErrorService.report(resolveAuthErrorMessage(error));
      }

      return throwError(() => error);
    }),
  );
};
