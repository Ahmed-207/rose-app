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
- [ ] Invalid `pi-[#A31D36]` class in `sidebar.html` is fixed to a valid PrimeIcons class.
- [ ] Mobile bottom nav duplication is evaluated; if trivial, replace the hardcoded `mainLayout.html` markup with the `MobileBottom` component. If not trivial, document as a follow-up.

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
