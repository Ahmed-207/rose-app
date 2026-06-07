import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const appRoutes: Route[] = [
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
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
];
