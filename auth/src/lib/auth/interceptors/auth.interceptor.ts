import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStorage } from '../storage/session-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorage = inject(SessionStorage);
  const session = sessionStorage.getSession();

  if (!session?.token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.token}`,
      },
    }),
  );
};
