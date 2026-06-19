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
      }
    ],
  },
];