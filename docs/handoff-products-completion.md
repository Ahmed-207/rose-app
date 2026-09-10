# Handoff Plan — Finish Admin Products Page CRUD

**Branch:** `feature/products-page`  
**Base commit:** `f3d569f`  
**Date:** 2026-09-09  
**Status:** Agreement reached; waiting for confirmation to proceed to `to-spec` / `to-tickets`.

---

## Background

The admin products feature was built on `feature/products-page` after merging a teammate's dynamic-form branch. The feature currently has uncommitted runtime fixes for routing (`ConfirmationService` NG0201) and the product-form upload/submit flow. Static analysis and prior session notes identify the remaining gaps that must be closed before the branch is ready for review.

---

## Agreed scope (Round 1 decisions)

| # | Decision | Agreed answer |
|---|----------|---------------|
| Q1 | Overall scope | Fix the core blockers first and commit them as a working CRUD baseline. Table enhancements (sorting, advanced filters) will follow in the same completion pass, not a separate branch. |
| Q2 | Sub-category selector | **Add it now.** Populate from `SubCategoriesService` based on selected category. |
| Q3 | Table sorting | **Add it now** for `title`, `price`, `stock`, `rating`, and `createdAt` via the API's `sortBy`/`sortOrder` query params. Figma verification was attempted but blocked by Figma API rate limits; proceed with the recommendation. |
| Q4 | View action in table | **Edit/Delete only.** User confirmed Figma shows only edit and delete actions; no separate view/detail route needed. |
| Q5 | Image/occasion requirements | Keep `cover` required. Make `description`, `gallery` (at least one), and `occasionIds` optional to match the API. User confirmed Figma is acceptable with this approach. |
| Q6 | Dynamic-form module boundary lint error | **Move the dynamic form to a proper `libs/shared/dynamic-form` library** and update all consumers. Do not add a temporary boundary exception. |
| Q7 | Existing uncommitted fixes | **Commit them first** as a standalone fix commit before new work begins. |
| Q8 | Small cleanup items | Add `provideAnimationsAsync()` and remove temporary `console.error` logs as part of this work. Fix the invalid `pi-[#A31D36]` sidebar class if trivial. Defer the mobile-bottom refactor unless it blocks products. |

---

## Root causes already identified

1. **Routing / `ConfirmationService` NG0201**  
   When `roseAdmin` is federated into `roseAppShell`, only the remote route array is consumed; the remote's `bootstrapApplication` and `app.config.ts` providers never run. PrimeNG requires `ConfirmationService` to be provided explicitly. The uncommitted fix adds it to the root remote route and shares `@angular/router` as a singleton. Still needs `provideAnimationsAsync()` for PrimeNG overlays.

2. **Upload appears broken**  
   `POST /api/upload` returns `{ payload: { url: "..." } }`. `APICallerService` unwraps `payload`, so the observable emits `{ url: "..." }`. The frontend interface `UploadImageRes` declares `imageUrl: string`, and the form reads `res.imageUrl`, which is always `undefined`.

3. **Submit appears broken**  
   Because `cover` and `gallery` are `Validators.required` and the upload never populates them, `customForm` is invalid and `save` is never emitted.

4. **Edit page loses existing data**  
   - `gallery` comes back from the API as a JSON string, but the edit page checks `Array.isArray(p.gallery)` and discards it.  
   - `occasions` objects contain `occasionId`, not `id`; the edit page maps `o.id` and stores join-table IDs instead of occasion UUIDs.

5. **Sub-category gap**  
   `subCategoryId` exists in the model and API, but the form hardcodes it to `''` and never renders a selector.

6. **Table is missing sort support**  
   `DataTableColumn` has no `sortable` flag and `p-table` is not wired to emit sort events or pass `sortBy`/`sortOrder` to the API.

7. **Nx lint failure**  
   `product-form.ts` imports the dynamic form via a deep relative path from `apps/shared/components/...`. Nx module boundaries require an npm-style scope.

---

## Work breakdown

### Phase A — Commit existing fixes and close runtime blockers
1. Commit the uncommitted changes as `fix(admin-products): resolve routing and upload regressions`.
2. Add `provideAnimationsAsync()` to both `roseAppShell` and `roseAdmin` `app.config.ts`.
3. Fix the upload response contract:
   - Change `UploadImageRes.imageUrl` to `url`.
   - Update `product-form.ts` cover/gallery upload handlers to use `res.url`.
   - Update unit-test mocks (`product-form.spec.ts`, `products.service.spec.ts`).
4. Fix edit-page data mapping:
   - Parse `gallery` from JSON string when needed.
   - Map occasions by `occasionId` (or `o.occasion.id`).
5. Remove temporary `console.error` debug logs from `product-form.ts`.
6. Run `nx test roseAdmin`, `nx lint roseAdmin`, `nx build roseAdmin`, and manual navigation to `/admin/products` and `/admin/products/create`.

### Phase B — Refactor dynamic form into a library
1. Create `libs/shared/dynamic-form` (or equivalent) and move the dynamic-form component, field config types, and tests there.
2. Update all consumers:
   - `roseAdmin` category pages.
   - `roseAdmin` product form.
   - Any other usages found in the workspace.
3. Fix the Nx module-boundary lint errors.
4. Re-run tests and lint.

### Phase C — Complete the product form
1. Add a sub-category dropdown populated from `SubCategoriesService`, filtered by selected category.
2. Make `description`, `gallery`, and `occasionIds` optional in the form model and validators.
3. Add `discountValue` range validation (e.g., `0–100` for `PERCENT`).
4. Reset native file inputs after successful upload or after removal so re-selecting the same file works.
5. Surface validation errors for hidden image controls or disable Save when they are invalid.

### Phase D — Complete the products table
1. Extend `DataTableColumn` with `sortable?: boolean` and `sortField?: string`.
2. Wire PrimeNG `p-table` `sortMode="multiple"` or `single` and emit `(sortFunction)`.
3. In `ProductsPage`, translate table sort events into `sortBy`/`sortOrder` query params and re-fetch.
4. Add mobile translation keys for Edit/Delete action menu items.
5. (Optional but recommended) Auto-dismiss delete-success message after a few seconds.

### Phase E — Verification
1. **Static checks:** `nx lint roseAdmin`, `nx test roseAdmin`, `nx build roseAdmin`, `nx build roseAppShell` (production failure for `roseMain` CSS budget is pre-existing and out of scope).
2. **Runtime checks:**
   - Log in as `elevatestudent` / `Elevate@123`.
   - Navigate directly to `http://localhost:4200/admin/products` — confirm no `NG0201`.
   - Create a product with cover + gallery images — confirm upload previews appear and save succeeds.
   - Edit the created product — confirm existing gallery and occasions load correctly.
   - Delete the product — confirm confirmation dialog and success feedback.
   - Test sorting on products table columns.
   - Test sub-category dropdown population.

---

## Files likely to change

- `apps/roseAdmin/src/app/remote-entry/entry.routes.ts`
- `apps/roseAdmin/src/app/app.config.ts`
- `apps/roseAppShell/src/app/app.config.ts`
- `apps/roseAdmin/src/app/pages/products/product-form/product-form.ts`
- `apps/roseAdmin/src/app/pages/products/product-form/product-form.html`
- `apps/roseAdmin/src/app/pages/products/product-form/product-form.spec.ts`
- `apps/roseAdmin/src/app/pages/products/product-create-page/product-create-page.ts`
- `apps/roseAdmin/src/app/pages/products/product-edit-page/product-edit-page.ts`
- `apps/roseAdmin/src/app/pages/products/products-page/products-page.ts`
- `apps/roseAdmin/src/app/pages/products/products-page/products-page.html`
- `apps/roseAdmin/src/app/shared/data-table/data-table.component.ts`
- `apps/roseAdmin/src/app/shared/data-table/data-table.model.ts`
- `apps/roseAdmin/src/app/shared/data-table/data-table.component.html`
- `libs/shared/products/src/lib/models/product.model.ts`
- `libs/shared/products/src/lib/services/products.service.ts`
- `libs/shared/products/src/lib/services/products.service.spec.ts`
- `apps/shared/components/dynamic-form/*` → new `libs/shared/dynamic-form/*`
- `apps/roseAdmin/src/app/core/layout/sidebar/sidebar.html` (icon class fix)

---

## Open questions / risks

1. **Figma verification blocked** — The Figma JSON endpoint returned HTTP 429 during this session. The user verbally confirmed Q3/Q4/Q5, but visual verification of sort indicators and exact form layout should be done as soon as the rate limit resets.
2. **Dynamic-form move** — This is the largest refactor. It affects categories and products. All category form tests must be re-run after the move.
3. **Backend/API model drift** — `gallery` is returned as a JSON string but sent as an array. The frontend can parse it, but the cleaner fix is a backend change; defer that to a separate backend task.
4. **Pre-existing `roseAppShell:build:production` failure** — CSS budget in `roseMain`; explicitly out of scope.

---

## Next step

Upon user confirmation, invoke:
1. `to-spec` skill to publish the spec to the project issue tracker, **or**
2. `to-tickets` skill to break the work into actionable tickets.

Then proceed with `implement` / `tdd` skills to execute the plan.
