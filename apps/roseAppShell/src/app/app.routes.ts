import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { roleGuard, Role } from '@org/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'auth',
    loadChildren: () =>
      loadRemote<typeof import('roseAuth/Routes')>('roseAuth/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'home',
    loadChildren: () =>
      loadRemote<typeof import('roseMain/Routes')>('roseMain/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'admin',
    canActivate: [roleGuard([Role.Admin])],
    loadChildren: () =>
      loadRemote<typeof import('roseAdmin/Routes')>('roseAdmin/Routes').then(
        (m) => m!.remoteRoutes
      ),
  },
    {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized').then(
        (m) => m.Unauthorized
      ),
  },
  {
    path: '500',
    loadComponent: () =>
      import('./pages/server-error/serverError').then(
        (m) => m.ServerError
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/notFound').then((m) => m.NotFound),
  }
];
