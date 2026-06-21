import { Route } from '@angular/router';
import { guestGuard } from '@org/auth';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    canActivate: [guestGuard],
    component: RemoteEntry,
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
        path: 'register',
        loadComponent: () => import('../pages/register/registerForm/register').then((m) => m.Register),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('../pages/forgot-password/forgot-password').then((m) => m.ForgotPassword)
      },
      {
        path: 'forgot-password/sent',
        loadComponent: () => import('../pages/forgot-password/forgot-password-sent').then((m) => m.ForgotPasswordSent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('../pages/reset-password/reset-password').then((m) => m.ResetPassword)
      }
    ],
  },
];