# Admin Data Table

This document describes the reusable `DataTableComponent` built for the `roseAdmin` dashboard and how to wire it up for Products, Categories, and Occasions list pages.

## Component overview

`DataTableComponent` is a generic, standalone Angular component based on PrimeNG Table. It renders paginated rows, row actions, and loading/empty/error states. It does **not** own the page title, search input, or "Add new" button — those live in the parent page.

Location:

- `apps/roseAdmin/src/app/shared/data-table/`

## Component API

### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `columns` | `DataTableColumn<T>[]` | yes | — | Column definitions. |
| `data` | `T[]` | yes | — | Rows to display. |
| `totalRecords` | `number` | yes | — | Total records available on the server. |
| `loading` | `boolean` | no | `false` | Shows a loading spinner when `true`. |
| `error` | `string \| null` | no | `null` | Shows an error message when set. |
| `page` | `number` | no | `1` | Current page (1-based). |
| `limit` | `number` | no | `10` | Rows per page. |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `pageChange` | `DataTablePageEvent` | Emitted when the user changes page or rows per page. |
| `editRow` | `T` | Emitted when the row's **Edit** button is clicked. |
| `deleteRow` | `T` | Emitted when the row's **Delete** button is clicked. |

### Column definition

```ts
export interface DataTableColumn<T = unknown> {
  field: keyof T | string;
  header: string;
  width?: string;
  cellTemplate?: TemplateRef<{ $implicit: T }>;
}
```

Use `cellTemplate` for custom rendering such as images, ratings, or product counts.

## Helper pipes

Local presentation pipes live in `apps/roseAdmin/src/app/shared/pipes/`:

- `countSuffix` — pluralizes a count: `{{ count | countSuffix:'product':'products' }}`
- `ratingBadge` — formats a rating: `{{ rating | ratingBadge:reviewCount }}`

## Wiring a domain page

The following examples assume the shared stores have been extended as described below.

### 1. Extend the domain store call

Each domain store now exposes a pagination-aware load method:

- `ProductsStore.loadProducts(filters)`
- `CategoriesStore.loadCategories(filters)`
- `OccasionsStore.loadOccasions(filters)`

Each store also exposes `applyFilters(filters)` (resets to page 1) and `resetFilters()`.

### 2. Build the parent page

A typical list page template:

```html
<section class="admin-page">
  <header class="admin-page-header">
    <h1>All Products</h1>
    <lib-button variant="primary" (clicked)="onAddProduct()">Add new product</lib-button>
  </header>

  <div class="admin-page-search">
    <input
      type="search"
      [ngModel]="searchQuery()"
      (ngModelChange)="onSearch($event)"
      placeholder="Search products..." />
  </div>

  <app-data-table
    [columns]="columns()"
    [data]="store.entities()"
    [totalRecords]="store.totalResults()"
    [loading]="store.isLoading()"
    [error]="store.error()"
    [page]="store.activeFilters().page ?? 1"
    [limit]="store.activeFilters().limit ?? 10"
    (pageChange)="onPageChange($event)"
    (editRow)="onEdit($event)"
    (deleteRow)="onDelete($event)" />
</section>
```

A typical component class:

```ts
import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ProductsStore } from '@org/products';
import { DataTableColumn, DataTablePageEvent } from '../../shared/data-table';

@Component({
  standalone: true,
  templateUrl: './products-page.html',
})
export class ProductsPage {
  private readonly store = inject(ProductsStore);

  readonly searchQuery = signal('');
  readonly searchQuery$ = toObservable(this.searchQuery);

  readonly nameCol: TemplateRef<{ $implicit: Product }> = viewChild.required('nameCell');

  readonly columns = signal<DataTableColumn<Product>[]>([
    { field: 'title', header: 'Name' },
    { field: 'price', header: 'Price' },
    { field: 'stock', header: 'Stock' },
    { field: 'sales', header: 'Sales' },
    { field: 'rating', header: 'Ratings' },
  ]);

  constructor() {
    this.searchQuery$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          this.store.applyFilters({ search: query.trim() || undefined });
          return [];
        }),
      )
      .subscribe();

    this.store.loadProducts({ page: 1, limit: 10 });
  }

  onPageChange(event: DataTablePageEvent): void {
    this.store.loadProducts({ page: event.page, limit: event.limit });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  onEdit(product: Product): void {
    // navigate or open dialog
  }

  onDelete(product: Product): void {
    // confirm and delete
  }
}
```

### Custom cell template example

```html
<ng-template #ratingCell let-product>
  {{ product.rating | ratingBadge:product.ratings }}
</ng-template>
```

```ts
readonly ratingCell = viewChild.required<TemplateRef<{ $implicit: Product }>>('ratingCell');

readonly columns = signal<DataTableColumn<Product>[]>([
  { field: 'title', header: 'Name' },
  { field: 'price', header: 'Price' },
  { field: 'stock', header: 'Stock' },
  { field: 'sales', header: 'Sales' },
  { field: 'rating', header: 'Ratings', cellTemplate: this.ratingCell() },
]);
```

## Shared library changes

The following shared products library changes support the admin table:

- `FilterParams` now includes an optional `search?: string` field. It is safe for `roseMain` because it is optional and `toHttpParams` skips undefined values.
- `CategoriesService.getCategories(filter?)` and `OccasionsService.getOccasions(filter?)` now accept optional `FilterParams`.
- `CategoriesStore` gained `loadCategories`, `applyFilters`, and `resetFilters`.
- `OccasionsStore` gained `loadOccasions`, `applyFilters`, and `resetFilters`.
- `ProductsStore` already supported pagination and search.

## Notes

- Default page size is `10`.
- Search should be debounced by `400 ms` in the parent page.
- The table uses server-side pagination. It emits `{ page, limit }` and the parent page reloads the store.
- Sorting, row selection, and bulk actions are not included in the current component version.
- The table is horizontally scrollable on mobile.
