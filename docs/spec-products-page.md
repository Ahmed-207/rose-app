# Admin Products Page with CRUD Operations

## Problem Statement

The `roseAdmin` dashboard currently has a reusable `DataTableComponent` but no products list page. Admins need a dedicated products page where they can view all products, search and filter them, create new products, edit existing products, and delete products — all within the admin theme and following the Figma workflow.

## Solution

Build an admin products page at `/admin/products` that consumes the reusable `DataTableComponent`. The page will support server-side pagination and search, a category filter, and child routes `/admin/products/create` and `/admin/products/:id/edit` for add/edit forms. Delete will use a confirmation dialog. The implementation will extend the shared products library to support sub-categories and extend the data table with responsive mobile behavior.

## User Stories

1. As an admin, I want to see a paginated list of products, so that I can manage inventory efficiently.
2. As an admin, I want to search products by title or description, so that I can quickly find a specific product.
3. As an admin, I want to filter products by category, so that I can narrow down the list.
4. As an admin, I want to click "Add new product" and go to a create form, so that I can add products to the catalog.
5. As an admin, I want to edit a product from the list, so that I can update its details.
6. As an admin, I want to delete a product with a confirmation dialog, so that I avoid accidental deletion.
7. As an admin, I want to see a success message after create/update/delete, so that I know the action succeeded.
8. As an admin, I want the page to work on mobile, so that I can manage products from any device.
9. As an admin, I want the create/edit form to support a cover image and a gallery of up to 5 images, so that products have rich media.
10. As an admin, I want form validation feedback, so that I know which fields are invalid before submitting.
11. As an admin, I want the table to show product image, name, category, price, stock, sales, and rating, so that I have the most relevant information at a glance.
12. As an admin, I want empty states to guide me to add a product when none exist, so that the page is helpful on first use.
13. As an admin, I want the page to load quickly and show loading states, so that I understand when data is being fetched.
14. As an admin, I want the page to follow the existing admin light/dark theme, so that the experience is consistent.
15. As a developer, I want the products page to reuse the shared `DataTableComponent`, so that maintenance is minimized.
16. As a developer, I want sub-categories supported in the shared products library, so that the form can show sub-categories per selected category.

## Implementation Decisions

### Routing
- Parent route: `/admin/products` displays the products list.
- Child route: `/admin/products/create` displays the create form.
- Child route: `/admin/products/:id/edit` displays the edit form for a given product ID.
- Routes are lazy-loaded components defined in `apps/roseAdmin/src/app/remote-entry/entry.routes.ts`.

### Page layout
- Header section with page title "Products" and "Add new product" primary button.
- Search input and category filter dropdown below the header.
- `DataTableComponent` below the filters.
- Empty state component when no products are found.
- Inline `lib-message` for page-level errors.

### Table columns
- Image + Name (combined cell)
- Category
- Price
- Stock
- Sales
- Rating
- Actions (edit/delete)
- For mobile: only Name, Price, Stock, and a 3-dots actions menu are shown.

### DataTableComponent extensions
- Add `hiddenOnMobile?: boolean` to `DataTableColumn`.
- Add a mobile actions menu (3-dots) rendered on small screens for the actions column.
- Keep existing desktop behavior unchanged.

### Shared products library extensions
- Add `SubCategoriesService` and `SubCategoriesStore` in `libs/shared/products`.
- Expose `loadSubCategories(categoryId?)` to load sub-categories optionally filtered by category.
- Ensure no regression for `roseMain` or existing admin consumers.
- Extend `FilterParams` if needed for category/sub-category filters (optional additions, backward-compatible).

### Form fields and validation
- `title`: required, min 3, max 120
- `description`: optional, max 1000
- `price`: required, greater than 0
- `stock`: required, integer, minimum 0
- `categoryId`: required
- `subCategoryId`: optional
- `occasionIds`: optional multi-select
- `discountType`: optional, enum `PERCENT` | `FIXED`
- `discountValue`: optional, greater than 0; if `discountType` is `PERCENT`, must be `<= 100`
- `cover`: optional image URL
- `gallery`: optional array of image URLs, max 5

### Image upload flow
- Use `POST /api/upload` with multipart `image` field (max 5MB).
- For cover: single-file upload.
- For gallery: multi-file select, upload in parallel, collect temp URLs, append to gallery array, enforce max 5.
- Show image preview and allow removing images before submit.

### Category and occasion selectors
- Category dropdown loads from `CategoriesStore`.
- Sub-category dropdown loads from `SubCategoriesStore` and is filtered by selected category.
- Occasions multi-select loads from `OccasionsStore`.

### Create/edit form dependency
- **Dependency**: A teammate is building a reusable dynamic form component for add/edit. This feature should integrate with it once approved by the team leader.
- **Fallback**: If the dynamic form is not ready, the products page will include its own form using `lib-form-control` and reactive forms. The spec anticipates both paths.

### API contracts
- `GET /api/products?page&limit&search&categoryId` — list products
- `POST /api/products` — create product
- `PATCH /api/products/{id}` — update product
- `DELETE /api/products/{id}` — soft delete product
- `POST /api/upload` — upload image

### Feedback and UX
- After successful create/update, navigate back to `/admin/products` and show a success `lib-message`.
- After delete, refresh the current table page and show a success message.
- Errors during load/submit show inline `lib-message` errors.
- Loading states use `lib-spinner`.

### Theming
- All components must respect the existing admin light/dark theme.
- Delete confirmation dialog uses PrimeNG `ConfirmDialog` with theme-aware styling.

## Testing Decisions

- Test external behavior, not implementation details.
- Unit test the products page component: initial load, search debounce, category filter, pagination, navigation to create/edit, delete confirmation.
- Unit test `SubCategoriesService` and `SubCategoriesStore` following the patterns of `CategoriesStore`/`OccasionsStore` tests.
- Unit test `DataTableComponent` mobile behavior and hidden columns.
- Integration tests are not required; focus on component/service/store unit tests using Angular TestBed.
- Prior art: `apps/roseAdmin/src/app/shared/data-table/data-table.component.spec.ts`, `libs/shared/products/src/lib/store/categories.store.spec.ts`, `apps/roseAdmin/src/app/pages/notifications/notifications.spec.ts`.

## Out of Scope

- Table column sorting (API supports it, but it is a future enhancement).
- Price range and occasion filters (category filter only in v1).
- Bulk actions or row selection.
- Soft-deleted products list or restore functionality.
- Product reviews management.
- Inventory history or audit logs.
- Advanced gallery features such as drag-and-drop reorder or image cropping.

## Further Notes

- The reusable `DataTableComponent` was implemented in issue #88 / branch `feature/reusable-dynamic-table`.
- The create/edit form depends on a teammate's dynamic form component and requires team-leader approval before final integration.
- The `SubCategoriesStore` must not break existing `roseMain` product listing behavior.
- The mobile table behavior should be verified against the Figma mobile view.
- Default page size is 10; search debounce is 400 ms.
