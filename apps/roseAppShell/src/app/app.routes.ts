import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { ResetPasswordRedirect } from './reset-password-redirect';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'reset-password',
    component: ResetPasswordRedirect,
  },
  {
    path: 'auth',
    loadChildren: () =>
      loadRemote<typeof import('roseAuth/Routes')>('roseAuth/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      loadRemote<typeof import('roseAdmin/Routes')>('roseAdmin/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'home',
    loadChildren: () =>
      loadRemote<typeof import('roseMain/Routes')>('roseMain/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  }
];
