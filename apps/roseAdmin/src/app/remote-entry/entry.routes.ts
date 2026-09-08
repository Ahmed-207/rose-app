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
        path: 'products',
        loadComponent: () =>
          import('../pages/products/products-page/products-page').then((c) => c.ProductsPage),
        title: 'Products',
      },
      {
        path: 'products/create',
        loadComponent: () =>
          import('../pages/products/product-create-page/product-create-page').then((c) => c.ProductCreatePage),
        title: 'Add Product',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('../pages/products/product-edit-page/product-edit-page').then((c) => c.ProductEditPage),
        title: 'Edit Product',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('../pages/categories/category-list').then(
            (c) => c.CategoryListComponent,
          ),
        title: 'Categories',
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('../pages/categories/add-edit-categories/add-edit-categories').then(
            (c) => c.AddEditCategoriesComponent,
          ),
        title: 'Add Category',
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('../pages/categories/add-edit-categories/add-edit-categories').then(
            (c) => c.AddEditCategoriesComponent,
          ),
        title: 'Edit Category',
      },
    ],
  },
];
