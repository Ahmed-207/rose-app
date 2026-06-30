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
      {
        path: 'products',
        loadComponent: () =>
          import('../pages/products-page/products-page').then(
            (c) => c.ProductsPage,
          ),
        title: 'Our Products',
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('../features/product/pages/productDetailPage').then(
            (m) => m.ProductDetailPage,
          ),
        title: 'Product Details',
      },
    ],
  },
];
