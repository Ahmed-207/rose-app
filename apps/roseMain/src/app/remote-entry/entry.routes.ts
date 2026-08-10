import { Route } from '@angular/router';
import { authGuard } from '@org/auth';
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
            (c) => c.ProductsPageComponent,
          ),
        title: 'Our Products',
      },
      {
        path: 'wishlist',
        loadComponent: () => import('../pages/wishlist/wishlistPage').then((c) => c.WishlistPage),
        title: 'wishlist'
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/orders-page/orders-page').then((c) => c.OrdersPage),
        title: 'Orders'
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
        path: 'cart',
        loadComponent: () =>
          import('../pages/cart-page/cart-page').then((c) => c.CartPage),
        title: 'Cart',
      },
      {
        path: 'about',
        loadComponent: () => import('../pages/about-us/aboutUs').then((c) => c.AboutUs),
        title: 'About Us'
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../pages/account-settings/accountSettingsPage').then(
            (c) => c.AccountSettingsPage,
          ),
        title: 'Account Settings',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'profile',
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('../pages/account-settings/components/profile-form/profileForm').then(
                (c) => c.ProfileForm,
              ),
            title: 'Account Settings',
          },
          {
            path: 'change-password',
            loadComponent: () =>
              import(
                '../pages/account-settings/components/change-password-form/changePasswordForm'
              ).then((c) => c.ChangePasswordForm),
            title: 'Change Password',
          },
        ],
      },
    ],
  }
];
