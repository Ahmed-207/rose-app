import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthActions } from '@org/auth'; // Adjust path according to your alias
import { IS_ADDRESS_REQUEST } from './address-http-context';

export const addressInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Check if this request explicitly belongs to the Address Library
  if (!req.context.get(IS_ADDRESS_REQUEST)) {
    return next(req); // Bypass completely if false
  }

  // 2. Inject AuthActions to pull the real-time token
  const authActions = inject(AuthActions);
  const session = authActions.getSession();
  const token = session?.token;

  // 3. If a token exists, attach it clone-style
  if (token) {
    const authorizedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return next(authorizedReq);
  }

  return next(req);
};