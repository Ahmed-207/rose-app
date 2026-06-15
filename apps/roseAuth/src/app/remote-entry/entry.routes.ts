import { Route } from '@angular/router';
import { guestGuard } from '@org/auth';
import { AuthLayout } from '../core/layout/auth-layout/auth-layout';
import { VerifyOtp } from '../pages/register/verifyOtp/verifyOtp';
import { Register } from '../pages/register/registerForm/register';
import { RegisterEmailVerification } from '../pages/register/emailVerification/registerEmailVerification';

export const remoteRoutes: Route[] = [
    {
        path: '',
        canActivate: [guestGuard],
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

      { path: 'send-email-verification', component: RegisterEmailVerification },
      { path: 'verify-otp',  component: VerifyOtp },
      { path: 'register',   component: Register },
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
