# Admin Products Page — Completion Spec

> **Status:** Ready for implementation  
> **Branch:** `feature/products-page`  
> **Base commit:** `f3d569f`  
> **Related:** Draft PR #101 (closes #93)

## Problem Statement

The `roseAdmin` products page has a working list, create, and edit scaffold, but runtime regressions and incomplete integration prevent the feature from being usable end-to-end. Navigating to `/admin/products` throws a `ConfirmationService` NG0201 error, image upload appears to fail, the form cannot be submitted, existing product data is lost on edit, and the table lacks sorting. The dynamic form component was merged from another branch but is not yet correctly integrated, and its current location under `apps/shared/` violates Nx module boundaries.

## Solution

Finish the admin products feature by closing the runtime blockers, integrating the dynamic form correctly, extending the shared table with sorting, and completing the form with sub-categories and proper validation. All work stays on `feature/products-page` and follows the API documentation and Figma design.

## User Stories

1. As an admin, I want to navigate to `/admin/products` without console errors, so that I can manage products.
2. As an admin, I want the sidebar and direct links to `/admin/products` to work, so that I can move around the admin app reliably.
3. As an admin, I want to see a paginated list of products with sorting, so that I can browse inventory efficiently.
4. As an admin, I want to search products by title or description, so that I can quickly find a specific product.
5. As an admin, I want to filter products by category, so that I can narrow down the list.
6. As an admin, I want to click "Add new product" and go to a create form, so that I can add products to the catalog.
7. As an admin, I want to edit a product from the list, so that I can update its details.
8. As an admin, I want to delete a product with a confirmation dialog, so that I avoid accidental deletion.
9. As an admin, I want to upload a cover image and gallery images when creating/editing a product, so that products have rich media.
10. As an admin, I want the upload to show a preview and not silently fail, so that I know the image was accepted.
11. As an admin, I want the edit form to load existing gallery images and occasion selections correctly, so that I don't lose data.
12. As an admin, I want to select a sub-category per product, so that products are categorized correctly.
13. As an admin, I want form validation feedback, so that I know which fields are invalid before submitting.
14. As an admin, I want to see a success message after create/update/delete, so that I know the action succeeded.
15. As an admin, I want the page to work on mobile, so that I can manage products from any device.
16. As a developer, I want the products page to reuse the shared `DataTableComponent`, so that maintenance is minimized.
17. As a developer, I want the dynamic form to live in a proper shared library, so that Nx module boundaries are respected.

## Implementation Decisions

### Routing and Module Federation
- The shell consumes `roseAdmin` remote routes; the remote's `bootstrapApplication` is **not** executed when federated.
- `ConfirmationService` must be provided at the root remote route level so it is available to all admin pages when mounted inside `roseAppShell`.
- `@angular/router` must be shared as a singleton in both `roseAppShell` and `roseAdmin` Module Federation configs so shell and remote use one router instance.
- Sidebar and mobile navigation links use absolute `/admin/...` paths.
- `provideAnimationsAsync()` must be added to both shell and remote `app.config.ts` so PrimeNG overlays animate correctly.

### Product list (`/admin/products`)
- Uses the shared `DataTableComponent`.
- Supports server-side pagination, search debounce (400 ms), and category filter.
- **Sorting is now in scope.** The table will expose sortable columns and translate sort events into `sortBy`/`sortOrder` query params.
- Sortable columns: `title`, `price`, `stock`, `rating`, `createdAt`.
- Actions per row: **Edit and Delete only** (Figma does not show a View action).
- Mobile: name, price, stock, and a 3-dots actions menu.

### DataTableComponent extensions
- Add `sortable?: boolean` and `sortField?: string` to `DataTableColumn`.
- Wire PrimeNG `p-table` sort events and emit a single `sortChange` output.
- Keep existing desktop behavior, mobile columns, and actions menu unchanged except for translating mobile menu labels.

### Product form (`/admin/products/create` and `/admin/products/:id/edit`)
- Uses the reusable dynamic form component for title, description, price, stock, discount type, and discount value.
- Uses local reactive form controls for category, sub-category, occasions, cover, and gallery.
- Sub-category dropdown populates from `SubCategoriesService` filtered by selected category.
- Occasions use a multi-select loaded from `OccasionsStore`.

### Form fields and validation
- `title`: required, min 3, max 120.
- `description`: optional, max 1000.
- `price`: required, greater than 0.
- `stock`: required, integer, minimum 0.
- `categoryId`: required.
- `subCategoryId`: optional.
- `occasionIds`: optional multi-select.
- `discountType`: optional, enum `PERCENT` | `FIXED`.
- `discountValue`: optional, greater than 0; if `discountType` is `PERCENT`, must be `<= 100`.
- `cover`: required image URL.
- `gallery`: optional array of image URLs, max 5.

### Image upload flow
- `POST /api/upload` with multipart `image` field (max 5MB).
- The API returns `{ payload: { url: "..." } }`; `APICallerService` unwraps `payload`, so the frontend receives `{ url: "..." }`.
- Cover: single-file upload; gallery: multi-file select, upload in parallel, collect URLs, enforce max 5.
- Client-side compression runs before upload to reduce the chance of `413 Request Entity Too Large`.
- Show image preview and allow removing images before submit.
- Reset native file inputs after upload or removal so re-selecting the same file works.

### Edit page data mapping
- The API returns `gallery` as a JSON string; the edit page must parse it to `string[]` when needed.
- The API returns `occasions` as objects with `occasionId` (and nested `occasion`); the edit page must map by `occasionId`.

### Dynamic form refactor
- Move the dynamic form component and its field-config types from `apps/shared/components/dynamic-form/` to a proper `libs/shared/dynamic-form` library.
- Update all consumers (categories pages, product form) to import via the library's npm scope.
- Ensure existing tests continue to pass after the move.

### API contracts
- `GET /api/products?page&limit&search&categoryId&sortBy&sortOrder` — list products.
- `POST /api/products` — create product.
- `PATCH /api/products/{id}` — update product.
- `DELETE /api/products/{id}` — soft delete product.
- `POST /api/upload` — upload image.

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
- Unit test the products page component: initial load, search debounce, category filter, pagination, sort change, navigation to create/edit, delete confirmation.
- Unit test `ProductFormComponent`: dynamic form submission flow, custom form validation, upload success/failure, edit-page prefilling.
- Unit test `SubCategoriesService` and `SubCategoriesStore` following the patterns of `CategoriesStore`/`OccasionsStore` tests.
- Unit test `DataTableComponent` sortable columns, mobile behavior, and hidden columns.
- Update existing test mocks that return `{ imageUrl: '...' }` to return `{ url: '...' }` to match the real API contract.
- Integration tests are not required; focus on component/service/store unit tests using Angular TestBed.
- Prior art: `apps/roseAdmin/src/app/shared/data-table/data-table.component.spec.ts`, `libs/shared/products/src/lib/store/categories.store.spec.ts`, `apps/roseAdmin/src/app/pages/products/product-form/product-form.spec.ts`.

## Out of Scope

- Price range, rating, occasion, and sub-category filters in the product list (category filter only in v1).
- Bulk actions or row selection.
- Soft-deleted products list or restore functionality.
- Product reviews management.
- Inventory history or audit logs.
- Advanced gallery features such as drag-and-drop reorder or image cropping.
- Fixing the pre-existing `roseAppShell:build:production` CSS budget failure in `roseMain`.

## Further Notes

- The reusable `DataTableComponent` was implemented in issue #88 / branch `feature/reusable-dynamic-table`.
- The dynamic form was merged from `feature/Reusable-dynamic-form` and now needs to be relocated to `libs/shared/dynamic-form`.
- Figma verification was attempted but blocked by Figma API rate limiting; the user confirmed edit/delete-only actions and the image/occasion optionality described above.
- Default page size is 10; search debounce is 400 ms.
- Admin credentials for manual verification: `elevatestudent` / `Elevate@123`.
- Environment files contain sensitive keys; do not log or commit them.
