# Tickets — Finish Admin Products Page CRUD

> **Milestone:** Admin products page ready for review  
> **Branch:** `feature/products-page`  
> **Spec:** `docs/spec-products-page.md`  
> **Handoff:** `docs/handoff-products-completion.md`  
> **GitHub issues:** [#102](https://github.com/Ahmed-207/rose-app/issues/102) – [#112](https://github.com/Ahmed-207/rose-app/issues/112)

---

## Ticket 1 — Commit existing runtime fixes

**Priority:** P0  
**Scope:** Close the current uncommitted changes as a standalone fix commit.

### Acceptance criteria
- [ ] The uncommitted changes on `feature/products-page` are committed with message `fix(admin-products): resolve routing and upload regressions`.
- [ ] Commit includes:
  - `ConfirmationService` provider at root remote route.
  - `@angular/router` shared singleton in both Module Federation configs.
  - Absolute `/admin/...` links in sidebar, mobile bottom, and main layout.
  - Product form save button fix and upload compression/error logging.
  - Updated unit tests for the save button.
- [ ] `git status` is clean before new work begins.

---

## Ticket 2 — Add animations provider for PrimeNG overlays

**Priority:** P0  
**Depends on:** Ticket 1

### Acceptance criteria
- [ ] `provideAnimationsAsync()` is added to `apps/roseAppShell/src/app/app.config.ts`.
- [ ] `provideAnimationsAsync()` is added to `apps/roseAdmin/src/app/app.config.ts`.
- [ ] The delete confirmation dialog animates and renders correctly on `/admin/products`.

---

## Ticket 3 — Fix image upload response contract

**Priority:** P0  
**Depends on:** Ticket 1

### Acceptance criteria
- [ ] `UploadImageRes` in `libs/shared/products/src/lib/models/product.model.ts` uses `url: string` instead of `imageUrl: string`.
- [ ] `product-form.ts` cover upload handler reads `res.url`.
- [ ] `product-form.ts` gallery upload handler reads `res.url`.
- [ ] `products.service.spec.ts` mocks return `{ url: '...' }`.
- [ ] `product-form.spec.ts` mocks return `{ url: '...' }`.
- [ ] Manual test: uploading a cover image on `/admin/products/create` shows the preview.

---

## Ticket 4 — Fix edit page data mapping

**Priority:** P0  
**Depends on:** Ticket 3

### Acceptance criteria
- [ ] `product-edit-page.ts` parses `gallery` from JSON string to `string[]` when the API returns a string.
- [ ] `product-edit-page.ts` maps `occasions` by `occasionId` (not `id`).
- [ ] `price`, `stock`, and `discountValue` are correctly coerced to numbers for the form.
- [ ] Manual test: editing a product loads its existing gallery and selected occasions.

---

## Ticket 5 — Add sub-category selector to product form

**Priority:** P1  
**Depends on:** Ticket 4

### Acceptance criteria
- [ ] `SubCategoriesService` is injected into `ProductFormComponent`.
- [ ] A sub-category dropdown is added to the form template.
- [ ] The dropdown is populated from `SubCategoriesService` and filtered by the selected `categoryId`.
- [ ] When the category changes, the sub-category selection is cleared.
- [ ] `subCategoryId` is included in the emitted `ProductFormValue`.
- [ ] Unit tests cover category change clearing sub-category.

---

## Ticket 6 — Refactor dynamic form into `libs/shared/dynamic-form`

**Priority:** P1  
**Depends on:** Ticket 1

### Acceptance criteria
- [ ] New library `libs/shared/dynamic-form` is created.
- [ ] Dynamic form component, field config types, and tests are moved from `apps/shared/components/dynamic-form/` into the library.
- [ ] All consumers updated:
  - `roseAdmin` category create/edit pages.
  - `roseAdmin` product form.
- [ ] No relative imports crossing into `apps/shared/components/dynamic-form/` remain.
- [ ] `nx lint roseAdmin` passes with no module-boundary errors related to the dynamic form.
- [ ] `nx test roseAdmin` passes.

---

## Ticket 7 — Extend DataTableComponent with sorting

**Priority:** P1  
**Depends on:** Ticket 1

### Acceptance criteria
- [ ] `DataTableColumn` interface gains `sortable?: boolean` and `sortField?: string`.
- [ ] `DataTableComponent` wires PrimeNG `p-table` sort events and emits `sortChange`.
- [ ] Sortable columns show the PrimeNG sort indicator.
- [ ] Default sort state is un-sorted or matches the API default.
- [ ] Unit tests cover sort event emission.

---

## Ticket 8 — Wire sorting into ProductsPage

**Priority:** P1  
**Depends on:** Ticket 7

### Acceptance criteria
- [ ] `ProductsPage` configures `title`, `price`, `stock`, `rating`, and `createdAt` as sortable columns.
- [ ] `ProductsPage` translates `sortChange` events into `sortBy` and `sortOrder` query params.
- [ ] `ProductsService.getProducts` accepts and forwards `sortBy` and `sortOrder`.
- [ ] Sorting resets to page 1 when changed.
- [ ] Manual test: clicking column headers in `/admin/products` sorts the table.

---

## Ticket 9 — Form validation and UX improvements

**Priority:** P2  
**Depends on:** Ticket 3, Ticket 5

### Acceptance criteria
- [ ] `description`, `gallery`, and `occasionIds` are optional in form model and validators.
- [ ] `cover` remains required.
- [ ] `discountValue` has max validation: `<= 100` when `discountType === 'PERCENT'`.
- [ ] Native file inputs are reset after successful upload and after image removal.
- [ ] Save button is disabled when `customForm` is invalid or while uploading.
- [ ] Temporary `console.error` debug logs in `product-form.ts` are removed.

---

## Ticket 10 — Admin layout cleanup

**Priority:** P2  
**Depends on:** Ticket 1

### Acceptance criteria
- [x] Invalid `pi-[#A31D36]` class in `sidebar.html` is fixed to a valid PrimeIcons class.
- [ ] Mobile bottom nav duplication is evaluated; if trivial, replace the hardcoded `mainLayout.html` markup with the `MobileBottom` component. If not trivial, document as a follow-up.

### Notes
- The `MobileBottom` component exists but the hardcoded `mainLayout.html` nav includes a custom floating center button and different active-state styling. Replacing it would change the visual design, so this is documented as a follow-up until the intended mobile design can be verified.

---

## Ticket 11 — Final verification and green CI

**Priority:** P0  
**Depends on:** Tickets 1–10

### Acceptance criteria
- [ ] `nx test roseAdmin` passes.
- [ ] `nx lint roseAdmin` passes.
- [ ] `nx build roseAdmin` succeeds.
- [ ] `roseAppShell:build:production` failure is confirmed to be the pre-existing `roseMain` CSS budget issue only.
- [ ] Manual runtime verification:
  - [ ] `/admin/products` loads with no `NG0201`.
  - [ ] Create product with cover + gallery succeeds and redirects to list with success message.
  - [ ] Edit product loads existing images and occasions correctly.
  - [ ] Delete product shows confirmation dialog and refreshes list.
  - [ ] Table sorting works for all configured columns.
  - [ ] Sub-category dropdown populates based on selected category.
- [ ] Final commit(s) pushed and draft PR #101 moved to ready for review.

---

## Ticket ordering

```
Ticket 1 ─┬─► Ticket 2
          ├─► Ticket 3 ──► Ticket 4 ──► Ticket 5 ─┐
          ├─► Ticket 6                              │
          ├─► Ticket 7 ──► Ticket 8                 │
          └─► Ticket 9 ─────────────────────────────┘
          └─► Ticket 10

Ticket 11 (final verification) depends on all above.
```

Tickets 2–6 and 7–8 can run in parallel once Ticket 1 is committed.

---

## Ticket 12 — Fix table header translation and mobile action labels

**Priority:** P0  
**Depends on:** Ticket 8

### Acceptance criteria
- [ ] `DataTableComponent` applies `| translate` to `col.header` in the template.
- [ ] Mobile action-menu labels use `ADMIN.DATA_TABLE.EDIT` and `ADMIN.DATA_TABLE.DELETE` keys.
- [ ] `en.json` and `ar.json` contain the new `ADMIN.DATA_TABLE.EDIT` / `ADMIN.DATA_TABLE.DELETE` keys.
- [ ] Unit test verifies translated headers are rendered.
- [ ] Manual test: switching language updates the products table headers.

---

## Ticket 13 — Fix query-param URL synchronization

**Priority:** P0  
**Depends on:** Ticket 8

### Acceptance criteria
- [ ] `ProductsPage.updateUrl()` emits the full normalized query-param object.
- [ ] Cleared/default params are set to `null` so Angular removes them from the URL.
- [ ] Changing sort/category/search/page updates the table reliably (no stale param rollback).
- [ ] Sorting from a non-first page resets to page 1 in both the URL and the loaded data.
- [ ] Unit test verifies stale params are cleared on filter reset.

---

## Ticket 14 — Create `AdminProductsStore` and migrate admin CRUD

**Priority:** P0  
**Depends on:** Ticket 13

### Acceptance criteria
- [ ] New `AdminProductsStore` is created in `libs/shared/products/src/lib/store/`.
- [ ] Store exposes:
  - `entities()`, `totalProducts()`, `isLoading()`, `error()` for the admin list.
  - `selectedProduct()`, `isSubmitting()`, `submitError()` for form flows.
  - `loadProducts(filters)`, `loadProductById(id)`, `addProduct(product)`, `updateProduct(id, product)`, `deleteProduct(id)`.
- [ ] `ProductsPage` uses `AdminProductsStore` for list/delete.
- [ ] `ProductCreatePage` uses `AdminProductsStore.addProduct()`.
- [ ] `ProductEditPage` uses `AdminProductsStore.loadProductById()` and `updateProduct()`.
- [ ] `ProductFormComponent` keeps using `ProductsService.uploadImage()` for image upload.
- [ ] After delete, the current page is reloaded; page is decremented if the page becomes empty.
- [ ] Unit tests cover store load, add, update, delete, and error states.
- [ ] `nx test roseAdmin` and `nx test shared-products` pass.

---

## Ticket 15 — Fix pagination active-page color and rows-per-page dropdown

**Priority:** P1  
**Depends on:** Ticket 8

### Acceptance criteria
- [ ] Active page selector targets `.p-paginator-page-selected` with `.p-paginator-page.p-highlight` fallback.
- [ ] Active page uses `#741C21` in light mode and `#FFC2CD`/`#202938` in dark mode with `!important`.
- [ ] `p-table` uses `[paginatorDropdownAppendTo]="'body'"` so the rows-per-page dropdown does not corrupt the footer.
- [ ] Manual test confirms active page color and dropdown behavior.

---

## Ticket 16 — Add Playwright admin products workflow tests

**Priority:** P1  
**Depends on:** Tickets 12–15

### Acceptance criteria
- [ ] `testAssets/` images are moved to `apps/roseAppShell-e2e/src/admin-products/test-assets/`.
- [ ] Reusable admin-login helper reads `ADMIN_USER` / `ADMIN_PASSWORD` env vars (fallback to `.env`).
- [ ] `.env.example` documents the required environment variables.
- [ ] Specs added under `apps/roseAppShell-e2e/src/admin-products/`:
  - `products-list.spec.ts` — login, translated headers, category/sort/page/rows-per-page, active-page color.
  - `products-crud.spec.ts` — create product with cover + gallery, edit existing product, delete product.
- [ ] Tests run headlessly with `npx nx e2e roseAppShell-e2e -- --project=chromium`.
- [ ] Tests clean up created products so the environment is not polluted.

---

## Ticket 17 — Final verification and push

**Priority:** P0  
**Depends on:** Tickets 12–16

### Acceptance criteria
- [ ] `nx test roseAdmin` passes.
- [ ] `nx test shared-products` passes (including new `AdminProductsStore` tests).
- [ ] `nx lint roseAdmin` has no new issues.
- [ ] `nx build roseAdmin` succeeds.
- [ ] Playwright admin workflow tests pass headlessly against local dev server.
- [ ] All changes are committed with clear messages referencing the related GitHub issues.
- [ ] Open related GitHub issues are closed.
- [ ] Branch is pushed; user creates the PR manually.
