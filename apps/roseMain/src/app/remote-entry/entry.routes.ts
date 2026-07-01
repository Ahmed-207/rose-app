import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { ProductDetails } from '../pages/product-details/product-details';

export const remoteRoutes: Route[] = [{
    path: '', component: RemoteEntry, children: [
        {
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
            path: '',
            redirectTo: 'main',
            pathMatch: 'full'
        },
        {
            path: 'main',
            loadComponent: () => import('../pages/home/homePage').then((c) => c.HomePage),
            title: 'Home Page'
        },
        {
<<<<<<< HEAD
>>>>>>> origin
=======
>>>>>>> main
            path: 'products',
            loadComponent: () => import('../pages/products-page/products-page').then((c) => c.ProductsPage),
            title: 'Our Products'
        },
        {
            path: 'products/:id',
            loadComponent: () => import('../pages/product-details/product-details').then((c) => ProductDetails),
            title: 'Product Details'
        }
    ]
}];
