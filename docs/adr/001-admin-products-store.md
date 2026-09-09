# ADR 001 — Dedicated `AdminProductsStore` for admin product CRUD

## Status
Accepted

## Context

The `ProductsStore` in `libs/shared/products` was built for the public catalog. It exposes list/read operations (`loadProducts`, `loadBestProducts`, `loadSearchDropdownProducts`) and uses `@ngrx/signals/withEntities` with `setAllEntities`, which replaces the entire product cache on every list load.

After the first implementation pass of the admin products page, several issues appeared:

1. The admin grid loaded products directly through `ProductsService` instead of a store.
2. Delete/create/update were also invoked through the service.
3. The admin grid uses `limit=10` while the public catalog uses `limit=12`; sharing the same root entity store would cause the two views to overwrite each other’s state when both run inside the federated shell.

## Decision

Create a dedicated `AdminProductsStore` in `libs/shared/products/src/lib/store/`.

### Scope of `AdminProductsStore`

- Own the admin product list state:
  - `entities()`
  - `totalProducts()`
  - `isLoading()`
  - `error()`
  - `activeFilters()`
- Own form/edit state:
  - `selectedProduct()`
  - `isSubmitting()`
  - `submitError()`
- Expose CRUD methods:
  - `loadProducts(filters)`
  - `loadProductById(id)`
  - `addProduct(product)`
  - `updateProduct(id, product)`
  - `deleteProduct(id)`

### What stays in `ProductsService`

- `uploadImage(file)` remains a service method. Image upload is an I/O side-effect that does not mutate product entities, so it does not belong in the product entity store.

### What stays in `ProductsStore`

- Public catalog read operations remain untouched. `ProductsStore` is not extended with CRUD methods, and admin components do not depend on it.

## Consequences

### Positive

- Admin list state is isolated from public catalog state; no cache collisions.
- All admin product reads and mutations flow through a single store, making loading/error states consistent.
- Components become service-free for CRUD, aligning with the workspace’s signal-store direction.
- Future admin features (bulk actions, soft-delete list, inventory logs) can extend `AdminProductsStore` without affecting the customer experience.

### Negative / Risks

- Slightly more code than extending `ProductsStore`.
- Existing `ProductsStore` unit tests do not cover admin behavior; new `AdminProductsStore` tests must be written.
- `ProductFormComponent` still needs a service injection for upload; this is intentional and documented.

## Related

- `docs/spec-products-page.md` — Retest fixes and architecture decisions.
- `docs/tickets-products-completion.md` — Tickets 12–17.
