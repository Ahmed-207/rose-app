import { Route } from '@angular/router';
// import { guestGuard } from '@org/auth';
import { AuthLayout } from '../core/layout/auth-layout/auth-layout';

export const remoteRoutes: Route[] = [
    {
        path: '',
        // canActivate: [guestGuard],
        component: AuthLayout,
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full',
            },
            {
                path: 'login',
                loadComponent: () => import('../pages/login/login').then((m) => m.Login),
            },
            //   {
            //     path: 'register',
            //     loadComponent: () => import('../register/register').then((m) => m.Register),
            //   },
            //   {
            //     path: 'forgot-password',
            //     loadComponent: () =>
            //       import('../forgot-password/forgot-password').then((m) => m.ForgotPassword),
            //   },
        ],
    },
];