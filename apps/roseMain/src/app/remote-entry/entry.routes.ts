import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [{
    path: '', component: RemoteEntry, children: [
        {
            path: 'products',
            loadComponent: () => import('../pages/products-page').then((c) => c.ProductsPage),
            title: 'Our Products'
        }
    ]
}];
