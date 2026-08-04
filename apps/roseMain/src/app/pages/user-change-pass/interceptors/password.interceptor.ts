import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthActions } from '@org/auth';
import { IS_PASSWORD_REQUEST } from './password-http-context';

export const ordersInterceptor: HttpInterceptorFn = (req, next) => {

    if (!req.context.get(IS_PASSWORD_REQUEST)) {
        return next(req);
    }


    const authActions = inject(AuthActions);
    const session = authActions.getSession();
    const token = session?.token;


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