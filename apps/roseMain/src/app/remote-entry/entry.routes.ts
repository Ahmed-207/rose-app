import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/home/pages/homePage').then((m) => m.HomePage),
      },
    ],
  },
];
