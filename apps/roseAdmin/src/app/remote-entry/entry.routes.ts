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
