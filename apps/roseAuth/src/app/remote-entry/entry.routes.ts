import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { Register } from '../pages/register/registerForm/register';
export const remoteRoutes: Route[] = [{
    path: '',
    component: RemoteEntry,
    children: [
      { path: 'register',   component: Register },
    ],
  },
];
