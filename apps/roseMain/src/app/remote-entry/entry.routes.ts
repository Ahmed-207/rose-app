import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full',
      },
      {
        path: 'main',
        loadComponent: () =>
          import('../pages/home/homePage').then((c) => c.HomePage),
        title: 'Home Page',
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
        path: 'wishlist',
        loadComponent: () => import('../pages/wishlist/wishlistPage').then((c) => c.WishlistPage),
        title: 'wishlist'
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('../pages/product-details/productDetailPage').then(
            (c) => c.ProductDetailPage,
          ),
        title: 'Product Details',
      },
      {
        path: 'about',
        loadComponent: () => import('../pages/about-us/aboutUs').then((c) => c.AboutUs),
        title: 'About Us'
      }
    ],
  }
];
