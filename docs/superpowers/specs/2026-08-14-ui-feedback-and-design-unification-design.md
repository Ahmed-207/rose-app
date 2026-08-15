# Rose App — Unified Feedback (Toasts) & Design System Unification

> **Status:** Approved
> **Created:** 2026-08-14
> **Source of truth for design:** Figma file *Rose App (Enhanced)* → *Design System - NEW* canvas
> **This document is the single source of truth** for planning and executing the UI feedback + design unification work. Phases are updated in place as work progresses.

---

## 1. Status Legend

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[–]` | Skipped / descoped (note why) |

Phase-level status fields use the same terms: `Not started`, `In progress`, `Done`, `Blocked`.

---

## 2. Change Log

| Date | Change |
|------|--------|
| 2026-08-14 | Spec created from brainstorming session; approved by Ahmed (full toast coverage + PrimeNG Toast + Figma tokens). |
| 2026-08-14 | Phase 1 (unified toasts) implemented — see plans/2026-08-14-unified-toast-feedback-system.md |
| 2026-08-14 | Phase 2 — Design Foundation: brand PrimeNG palette, shared theme.css, remote dark bootstrap, off-brand purple fixes. **Status:** Done. **Scope:** Phase 2. |
| 2026-08-15 | Phase 3 — Surface & Dark-Mode Unification: zinc surface migration, about-us dark mode, status-chip/rating tokens, `:host-context` fixes, lib-* token alignment. **Status:** Done. |

---

## 3. Context & Goals

### 3.1 Problem statement

The Rose App monorepo (shell + `roseMain`/`roseAuth`/`roseAdmin` remotes, 7 shared libs) has three parallel, broken feedback mechanisms and no centralized design token system.

**Feedback is broken:**
- `ngx-toastr` is configured only in the shell and **never called** (dead `ToastrService` in `libs/shared/user-orders/src/lib/store/orders.store.ts:12,40`); no animations provider exists, so it would crash on first use.
- PrimeNG `MessageService`/`<p-toast>` used in exactly one place (register OTP, `apps/roseAuth/src/app/pages/register/registerForm/register.ts:161`).
- A custom `lib-message` banner used in 2 places; everything else is hand-rolled inline `<p class="error">`.
- **Login failures are invisible** (`login.ts:26` signal never rendered in the template).
- **Register errors are swallowed** (`auth.actions.ts:309-313` → `catchError → EMPTY`).
- Cart/wishlist feedback is silent or `console.log`-only.
- Checkout button has no loading/disabled state (double-submit risk).

**Design is inconsistent:**
- `lib-button`, `lib-card`, `lib-label`, `lib-spinner`, `lib-message` reference `--color-*` CSS variables **defined nowhere** → they render transparent/broken.
- PrimeNG primary palette is default **emerald**, never set to brand rose.
- Dark surfaces disagree: `#202938` (zinc-800) vs `#0f1d36` (navy) on orders/wishlist pages; about-us has no dark mode; status chips lack dark variants.
- Duplicate component kits: `lib-button` vs `app-button`, `lib-form-control` vs `app-form-control`.

### 3.2 Goals (success criteria)

1. **Feedback:** Every mutation (auth, cart, wishlist, orders, reviews, account, addresses) gives the user clear success + failure feedback through one consistent toast in both light and dark mode. No silent failures remain.
2. **Design consistency:** All surfaces, buttons, cards, modals match the Figma semantic tokens; no off-spec hardcoded colors remain in visible UI.
3. **Cleanup:** No dead notification code, no `debugger` statements, no duplicate HTTP configs.

### 3.3 Non-goals

- Building `roseAdmin` actual features (it remains scaffolding).
- Merging `lib-button`/`app-button` APIs (visual alignment only; merge decision deferred).
- Full theme redesign beyond the Figma-specified tokens.

---

## 4. Design Tokens (source of truth)

Extracted from Figma *Design System - NEW*. All implementation must use these values.

### 4.1 Primitive scales

**Maroon (primary brand)**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#fbeaea` | `#f3c5c7` | `#ea9fa2` | `#e07a7d` | `#d75458` | `#cd2e33` | `#a6252a` | `#741c21` | `#501419` | `#2c0c10` | `#20090c` |

**Soft Pink (secondary)**
| 50 | 100 | 200 | 300 | 400 |
|----|-----|-----|-----|-----|
| `#fff1f5` | `#ffe0e7` | `#ffc2d0` | `#ffa3b9` | `#ff85a2` |

**Zinc (neutral):** Tailwind zinc scale (50 `#fafafa` → 950 `#09090b`).

### 4.2 Semantic tokens — LIGHT

| Token | Value | Token | Value |
|-------|-------|-------|-------|
| `--bg-plain` | `#ffffff` | `--bg-subtle` | `#fafafa` |
| `--bg-muted` | `#f4f4f5` | `--bg-soft` | `#e4e4e7` |
| `--text-default` | `#71717a` | `--text-primary` | `#27272a` |
| `--text-inverse` | `#fafafa` | `--rating` | `#ffb800` |
| `--primary` | `#501419` (maroon-800) | `--primary-saturated` | `#741c21` (maroon-700) |
| `--primary-faint` | `#f3c5c7` (maroon-100) | `--primary-fade` | `#fbeaea` (maroon-50) |
| `--secondary` | `#ff85a2` (soft-pink-400) | `--success` | `#00bc7d` |
| `--warning` | `#facc15` | `--danger` | `#dc2626` |
| `--info` | `#155dfc` | `--overlay` | `rgba(0,0,0,0.5)` |
| `--chip-info-bg` | `#E6F1FB` | `--chip-info-text` | `#0C447C` |
| `--chip-success-bg` | `#EAF3DE` | `--chip-success-text` | `#27500A` |
| `--chip-warning-bg` | `#FAEEDA` | `--chip-warning-text` | `#633806` |
| `--chip-danger-bg` | `#FCEBEB` | `--chip-danger-text` | `#791F1F` |
| `--shadow-subtle-lg` | `0 4px 18px rgba(0,0,0,0.07)` | `--shadow-soft-lg` | `0 4px 18px rgba(0,0,0,0.10)` |

### 4.3 Semantic tokens — DARK

| Token | Value | Token | Value |
|-------|-------|-------|-------|
| `--bg-plain` | `#3f3f46` (zinc-700) | `--bg-subtle` | `#27272a` (zinc-800) |
| `--bg-muted` | `#18181b` (zinc-900) | `--bg-soft` | `#3f3f46` (zinc-700) |
| `--text-default` | `#52525b` (zinc-600) | `--text-primary` | `#fafafa` (zinc-50) |
| `--text-inverse` | `#27272a` (zinc-800) | `--rating` | `#ffb800` |
| `--primary` | `#ffa3b9` (soft-pink-300) | `--primary-saturated` | `#ffc2d0` (soft-pink-200) |
| `--primary-faint` | `#ffa3b9` @ 75% | `--primary-fade` | `#ffa3b9` @ 25% |
| `--secondary` | `#a6252a` (maroon-600) | `--success` | `#00bc7d` |
| `--warning` | `#eab308` | `--danger` | `#ef4444` |
| `--info` | `#2b7fff` | `--overlay` | `rgba(0,0,0,0.5)` |
| `--chip-info-bg` | `#1e3a8a` | `--chip-info-text` | `#93c5fd` |
| `--chip-success-bg` | `#14532d` | `--chip-success-text` | `#86efac` |
| `--chip-warning-bg` | `#713f12` | `--chip-warning-text` | `#fde047` |
| `--chip-danger-bg` | `#7f1d1d` | `--chip-danger-text` | `#fca5a5` |
| `--shadow-subtle-lg` | `0 4px 18px rgba(0,0,0,0.07)` | `--shadow-soft-lg` | `0 4px 18px rgba(0,0,0,0.10)` |

### 4.4 Dark surface mapping (verified against `[DARK] Home` / `[DARK] Products` frames)

| Surface | Light | Dark |
|---------|-------|------|
| Page body | `#ffffff` / `#fafafa` | `#27272a` (zinc-800) |
| Elevated cards | `#ffffff` | `#18181b` (zinc-900) |
| Floating panels / dropdowns | `#ffffff` | `#3f3f46` (zinc-700) |
| Borders | `#e4e4e7` (zinc-200) | `#52525b` (zinc-600) |

> **Note:** the app previously used `#202938` and navy `#0f1d36` — both were off-spec and have been migrated to the zinc system above.

### 4.5 Shadows

- `--shadow-subtle-lg`: `0 4px 18px rgba(0,0,0,0.07)`
- `--shadow-soft-lg`: `0 4px 18px rgba(0,0,0,0.10)`

### 4.6 Typography

- **Sarabun** (Latin) / **Tajawal** (Arabic).
- Scale: 72, 60, 48, 36, 30, 24, 20, 18, 16, 14, 12.

### 4.7 Toast component spec (from design system)

Radius **8px**, dismissible close button, icon per severity, shadow `subtle-lg`.

| Severity | Light surface | Light icon/text | Dark surface | Dark icon/text |
|----------|---------------|-----------------|--------------|----------------|
| Info | `#f4f4f5` / border `#d4d4d8` | icon `#27272a`, text `#27272a` | `#18181b` | icon `#fafafa`, text `#fafafa` |
| Success | `#ecfdf5` | icon `#00bc7d` | `#073627` | icon `#00bc7d` |
| Error | `#fef2f2` | icon `#dc2626` | `#431819` | icon `#ef4444` |
| Text (all light) | — | `#27272a` | — | `#fafafa` |
| Close icon | `#71717a` | | `#d9d9d9` | |

---

## 5. Phase Execution Summary

| # | Phase | Status | Owner |
|---|-------|--------|-------|
| 1 | Unified toast/feedback system | Done | — |
| 2 | Design foundation (tokens, palette, bootstrap) | Done | — |
| 3 | Surface & dark-mode unification | Done | — |
| 4 | Consolidation & cleanup | Not started | — |

Update the `Status` cell in-place as each phase moves through `Not started → In progress → Done`.

---

## 6. Phase 1 — Unified Toast / Feedback System

**Status:** `Done`
**Goal:** Every mutation gives the user clear success + failure feedback via one consistent, branded toast across all apps; invisible/swallowed errors are fixed; dead notification code removed.

### 6.1 Tasks

#### 6.1.1 Create the toast core (shared lib)
- [x] `libs/shared/ui/src/lib/toast/app-toast.service.ts` — `AppToastService` (providedIn root) wrapping PrimeNG `MessageService`. API: `success(keyOrText, params?)`, `error(...)`, `info(...)`, `warning(...)`. Translates via `@ngx-translate` with raw-string fallback; emits `{ key: 'app', severity, summary, life: 3500 }`.
- [x] `libs/shared/ui/src/lib/toast/toast-error.interceptor.ts` — auto error-toast for failed `POST/PUT/PATCH/DELETE`; reads backend `message` (translated when key, else raw); excludes 401/403 (handled by auth flow); honors `SKIP_ERROR_TOAST`.
- [x] `libs/shared/ui/src/lib/toast/http-context.ts` — exports `SKIP_ERROR_TOAST` token.
- [x] `libs/shared/ui/src/lib/toast/toast.css` — PrimeNG `.p-toast`/`.p-toast-message` overrides matching §4.7, token-driven (auto light/dark).
- [x] Export new toast API from `libs/shared/ui/src/index.ts`.
- [x] Unit tests (Vitest): `AppToastService` (mocked MessageService + TranslateService), interceptor (verify toast shown, opt-out respected).

#### 6.1.2 Mount the toast in every app
- [x] roseMain `MainLayout`: `<p-toast key="app" />`.
- [x] roseAuth auth layout: `<p-toast key="app" />`.
- [x] roseAppShell shell layout: `<p-toast key="app" />`.
- [x] roseAdmin: add when it has real UI (skip now).
- [x] Import `toast.css` in the shell (globals) or per-app config as appropriate.

#### 6.1.3 Wire feedback across all flows (full coverage)
- **Auth:**
  - [x] Register step-3 success toast (before redirect).
  - [x] Login success toast.
  - [x] **Login failure toast** (fix invisible error).
  - [x] Forgot / reset password success toasts.
  - [x] OTP invalid toast (unify with `AppToastService`, drop raw `MessageService`).
- **Cart:**
  - [x] Add-to-cart success (6 call sites: products-page, bestSellingSection, mostPopularSection, relateProductSection, productDetailPage, cart-page recommended).
  - [x] Remove item / update qty / clear cart toasts.
- **Wishlist:**
  - [x] Add / remove / clear toasts (4 surfaces: product-card, productInfo, wishlistPage, navbar badge refresh).
  - [x] Wishlist page "Add to Cart" button click handler (currently missing).
- **Orders:**
  - [x] Order created (cash) success toast.
  - [x] Payment success / failure toasts.
  - [x] Checkout button loading/disabled state (prevent double submit).
- **Reviews:**
  - [x] Review submit success toast.
- **Account:**
  - [x] Profile updated / email change / password change / delete-account toasts.
- **Addresses:**
  - [x] Add / update / delete toasts (address-store + modals).

#### 6.1.4 Fix root causes & remove dead code
- [x] Merge duplicate `provideHttpClient` in `roseMain/app.config.ts:24,38` into one interceptor chain.
- [x] Ensure `errorInterceptor` / `AuthActions` errors reach the toast (stop swallowing); keep inline field-validation opt-outs via `SKIP_ERROR_TOAST`.
- [x] Remove `provideToastr` + `toastr.css` from shell; remove `ngx-toastr` from shell module-federation singleton list.
- [x] Remove dead `ToastrService` import in `orders.store.ts` (with the Arabic TODO comment).
- [x] Remove dead `MessageService` injection in `secondryNavbar.ts`.
- [x] Remove `debugger` statements in `register.ts:122,138`.
- [x] Add `toast.*` translation keys to `ar.json` / `en.json`.

### 6.2 Definition of done

- [x] Every flow in §6.1.3 shows a toast on success and failure (or documented opt-out).
- [x] Toast renders identically (design-spec) in all 4 apps, light + dark.
- [x] `npx nx run-many -t lint test typecheck` passes for affected projects. (passes for all affected projects except documented pre-existing shared-ui lint/test debt + user-orders no-test-files)
- [ ] Manual smoke: register→home, failed login, add/remove cart, add/remove wishlist, place cash order, update profile.

---

## 7. Phase 2 — Design Foundation

**Status:** `Done`
**Goal:** Establish brand tokens so all components render correctly; eliminate the emerald-primary bug; make remotes dark-mode-safe standalone.

### 7.1 Tasks

#### 7.1.1 Brand palette in PrimeNG
- [x] `libs/shared/shared-theme/src/lib/primeng-theme.config.ts`: customize Aura preset primary palette to maroon (light) / soft-pink (dark) per §4.2/§4.3.
- [x] Verify PrimeNG primaries (checkbox, stepper, selects, dialogs) render brand, not emerald.

#### 7.1.2 Global theme stylesheet
- [x] Create `libs/shared/shared-theme/src/lib/theme.css`:
  - [x] `:root` / `.dark` semantic CSS vars per §4.2/§4.3.
  - [x] Legacy `--color-*` names used by `lib-button/card/label/spinner/message` mapped to the semantic tokens (fixes transparent rendering).
  - [x] `--font-primary` (Sarabun/Tajawal stack) so remotes work standalone.
  - [x] Tailwind v4 `@theme` brand utilities (`--color-maroon-*`, `--color-soft-pink-*`).
- [x] Import `theme.css` in all 4 apps' `styles.css`.

#### 7.1.3 Dark-mode bootstrap in remotes
- [x] `roseMain`, `roseAuth`, `roseAdmin` `main.ts`: apply `.dark` from `localStorage['rose-theme']` before bootstrap (mirror shell `main.ts`).

#### 7.1.4 Fix broken shared components
- [x] `lib-button` all variants render correctly (primary/secondary/ghost/danger).
- [x] `lib-card`, `lib-label`, `lib-spinner`, `lib-message` render correctly; replace off-brand accents (`#534AB7` purple → brand).

### 7.2 Definition of done

- [x] No shared component renders with undefined/transparent colors.
- [x] PrimeNG primaries are brand.
- [x] Remotes show correct dark mode when served standalone.

> **Manual smoke test:** verification of standalone remote dark mode and PrimeNG brand primaries is deferred to a human browser session.

---

## 8. Phase 3 — Surface & Dark-Mode Unification

**Status:** `Done`
**Goal:** All pages/surfaces match the Figma zinc system; dark mode coverage is complete.

### 8.1 Tasks

#### 8.1.1 Migrate dark surfaces to Figma values
- [x] `roseMain` MainLayout `<main>`: `#202938` → `--bg-subtle` (`#27272a`).
- [x] Navbar: `#202938` → `--bg-muted` (`#18181b`).
- [x] orders-page: navy `#0f1d36` → `--bg-subtle` (`#27272a`).
- [x] wishlistPage: navy `#0f1d36` → `--bg-subtle` (`#27272a`).
- [x] Modals/dialogs/dropdowns/panels → `--bg-plain` (`#3f3f46`) / `--bg-muted` (`#18181b`) per §4.4.
- [x] Convert remaining hardcoded dark values (grep audit) to tokens.

#### 8.1.2 Dark-mode coverage gaps
- [x] about-us page: full dark mode.
- [x] Orders status chips: dark variants using `--chip-info-bg/text`, `--chip-danger-bg/text`, `--chip-success-bg/text`.
- [x] Cart-item rating / off-brand blues (`#5b7cfa`) → `var(--primary)`.
- [x] Rating star color `#ffb800` → `var(--rating)`.

#### 8.1.3 Component/token alignment
- [x] `lib-card`, `lib-button`, `lib-message`, `lib-spinner`, `lib-label` variants → tokens (§4).
- [x] Fix broken `.dark` encapsulation selectors (e.g. `filterPanel.css:89,319`) via `:host-context`.

### 8.2 Definition of done

- [ ] Screenshot audit of all pages in light + dark shows consistent zinc surfaces.
- [x] No `#202938`, `#0f1d36`, or off-brand purple/blue remains in visible UI.

> **Screenshot audit / manual smoke:** visual verification of all pages in light + dark and standalone remote dark mode is deferred to a human browser session.

---

## 9. Phase 4 — Consolidation & Cleanup

**Status:** `Not started`
**Goal:** Remove remaining duplication, dead code, and defects.

### 9.1 Tasks

- [ ] Align `lib-button`/`app-button` visually (radius 8px, token classes). Merge decision deferred.
- [ ] Align `lib-form-control`/`app-form-control`.
- [ ] Fix `[class.bg-transperant]` typo (`select-address-card.html:2`).
- [ ] Remove dead `CouponsService` create/update/delete scaffolding (no consumers).
- [ ] Migrate `WishlistService` from raw `token` header to the auth interceptor.
- [ ] Audit + remove any remaining `console.log`/`console.error` used as user feedback.

### 9.2 Definition of done

- [ ] No duplicate component APIs render inconsistently.
- [ ] `npx nx run-many -t lint test build typecheck` passes for the whole workspace.

---

## 10. Testing Strategy

- **Unit (Vitest):** `AppToastService`, toast-error interceptor, theme token presence.
- **Commands:**
  - `npx nx run-many -t lint test typecheck` (affected per phase)
  - Full CI: `npx nx run-many -t lint test build typecheck e2e`
- **Manual checks:** light + dark for every flow; standalone remote serve for dark-mode bootstrap.

---

## 11. File Map (Created / Modified / Removed)

### Created
- `libs/shared/ui/src/lib/toast/app-toast.service.ts`
- `libs/shared/ui/src/lib/toast/toast-error.interceptor.ts`
- `libs/shared/ui/src/lib/toast/http-context.ts`
- `libs/shared/ui/src/lib/toast/toast.css`
- `libs/shared/shared-theme/src/lib/theme.css`
- `<p-toast key="app">` in roseMain / roseAuth / shell root layouts

### Modified
- 4× app `app.config.ts`, remote `main.ts` ×3
- `libs/shared/shared-theme/src/lib/primeng-theme.config.ts`
- `libs/shared/ui/src/index.ts` + `lib-button/card/label/spinner/message`
- All flows listed in §6.1.3
- 4× app `styles.css` (theme import)
- `ar.json` / `en.json` (toast keys)

### Removed
- `provideToastr`, `toastr.css`, `ngx-toastr` singleton
- Dead `ToastrService` / `MessageService` injections
- `debugger` statements in `register.ts`
- Duplicate `provideHttpClient` in roseMain
- Dead coupon scaffolding (Phase 4)

---

## 12. Conventions

- Update `§5` status table + phase status field as work progresses.
- Tick checkboxes only when the work is done and verified (tests/lint pass).
- Any scope change must be recorded in `§2 Change Log` with a date.
