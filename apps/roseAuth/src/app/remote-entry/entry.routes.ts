import { Route } from '@angular/router';
import { guestGuard } from '@org/auth';
import { AuthLayout } from '../core/layout/auth-layout/auth-layout';

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
      {
        path: 'send-email-verification',
        loadComponent: () => import('../pages/register/emailVerification/registerEmailVerification').then((m) => m.RegisterEmailVerification),
      },
      {
        path: 'verify-otp',
        loadComponent: () => import('../pages/register/verifyOtp/verifyOtp').then((m) => m.VerifyOtp),
      },
      {
        path: 'register',
        loadComponent: () => import('../pages/register/register').then((m) => m.Register),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('../pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
    ],
  },
];