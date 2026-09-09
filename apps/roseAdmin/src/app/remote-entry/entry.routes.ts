import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../pages/dashboard/dashboard').then((c) => c.Dashboard),
        title: 'Dashboard',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../pages/notifications/notifications').then((c) => c.NotificationsPage),
        title: 'Notifications',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/settings/settings').then((c) => c.Settings),
        title: 'Account Settings',
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('../pages/settings/settings').then((c) => c.Settings),
        title: 'Change Password',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/settings/settings').then((c) => c.Settings),
        title: 'Settings',
      },
    ],
  },
];
