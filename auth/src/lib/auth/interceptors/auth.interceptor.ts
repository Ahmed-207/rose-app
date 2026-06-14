import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthCookieStorage } from '../storage/auth-cookie-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authCookieStorage = inject(AuthCookieStorage);
  const session = authCookieStorage.getSession();

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
