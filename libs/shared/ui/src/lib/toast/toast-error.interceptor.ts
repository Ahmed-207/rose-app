import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppToastService } from './app-toast.service';
import { SKIP_ERROR_TOAST } from './http-context';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const toastErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MUTATING_METHODS.has(req.method) || req.context.get(SKIP_ERROR_TOAST)) {
    return next(req);
  }

  const toast = inject(AppToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        toast.error(resolveToastMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

function resolveToastMessage(error: HttpErrorResponse): string {
  const body = error.error as { message?: unknown } | null;
  if (body && typeof body.message === 'string' && body.message) {
    return body.message;
  }
  return error.status === 0 ? 'common.NETWORK_ERROR' : 'common.REQUEST_FAILED';
}
