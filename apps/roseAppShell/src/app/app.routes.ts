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
    path: 'admin',
    canActivate: [roleGuard([Role.Admin])],
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
  },
  
];
