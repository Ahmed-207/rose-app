---
date: 2026-08-15
tags: [spec, design, phase-5]
---

# Phase 5 — Unified Loading States & Entrance Animations

## Purpose

Make every Rose App GET-request screen feel fast, polished, and consistent. Replace ad-hoc loading indicators with a small family of reusable skeleton and spinner patterns, and add subtle entrance animations so content does not pop in jarringly after a request completes.

## Scope

**In scope (this phase):**
- `roseMain` pages that load data over HTTP GET:
  - Products list (`products-page`)
  - Product details (`productDetailPage`)
  - Cart (`cart-page`)
  - Addresses (shipping address, my-addresses modal, address cards)
  - Wishlist (`wishlistPage`)
  - Orders (`orders-page`)
  - Home sections: most-popular, best-selling, testimonials
  - Account settings profile form
- Shared libraries that own the data fetching:
  - `libs/shared/products`
  - `libs/shared/user-addresses`
  - `libs/shared/user-orders`
  - `libs/shared/ui` (new loading components live here)

**Out of scope (future phase):**
- `roseAuth` / `roseAdmin` remotes
- Mutating requests (POST/PUT/DELETE) — those already use toasts and inline button spinners
- Route-level page transitions

## Design principles

1. **Full-page first load** → `lib-spinner` (overlay or inline) is acceptable when there is no content at all.
2. **Lists, grids, and cards** → `lib-skeleton-*` placeholders that mirror the final layout so the UI does not reflow when data arrives.
3. **Content reveal** → after loading finishes, children fade/slide in with a short CSS animation.
4. **One source of truth** → loading state is read from the existing signal store (`isLoading()`); components do not introduce new loading flags unless the store lacks one.
5. **No new runtime dependencies** → animations are pure CSS/Tailwind keyframes; skeletons are plain HTML/CSS components.

## Visual specs

### Skeleton

- Base color: `var(--bg-muted)` in light mode, `#27272a` in dark mode.
- Shimmer: a diagonal gradient sweep using `var(--bg-soft)` as the highlight, animated left-to-right every 1.5s.
- Border radius matches the element it replaces:
  - Text lines: `rounded-md`
  - Cards: `rounded-3xl` (matches `product-card`)
  - Buttons/avatars: `rounded-full`
- Pulse fallback: if `prefers-reduced-motion` is active, show a static muted fill instead of the shimmer.

### Entrance animations

Applied to the real content wrapper only after `!isLoading() && hasData()`.

- `.animate-fade-in`: opacity 0 → 1, 250ms ease-out.
- `.animate-slide-up`: translateY(12px) opacity 0 → translateY(0) opacity 1, 300ms ease-out.
- `.animate-stagger-*`: when a parent has `.animate-stagger`, direct children get `.animate-slide-up` with a 50ms delay increment (up to 400ms max).

All animations respect `prefers-reduced-motion: reduce` by disabling transforms and shortening opacity duration to 0ms.

## Components

### `lib-skeleton`

A generic skeleton block.

```html
<lib-skeleton class="h-4 w-32 rounded-md"></lib-skeleton>
```

Props (Angular signal inputs):
- none — styling is entirely via host classes (Tailwind utility classes on the element).

Responsibilities:
- Render a single shimmering block.
- Expose CSS custom properties for shimmer timing so pages can override.

### `lib-skeleton-card`

A pre-composed product-card-shaped skeleton.

```html
<lib-skeleton-card />
```

Layout mirrors `lib-product-card`:
- Image placeholder (aspect-ratio maintained)
- Title placeholder (2 lines)
- Price placeholder
- Action button placeholder

### `lib-skeleton-list`

Repeats a skeleton row for tabular/list content.

```html
<lib-skeleton-list [rows]="5" />
```

Default row is a full-width bar with a leading circle and two text lines.

### `lib-content-reveal`

A host directive or wrapper component that adds entrance animation classes when its content becomes visible.

```html
<lib-content-reveal>
  <!-- real content -->
</lib-content-reveal>
```

For simple cases, pages may apply `.animate-fade-in` directly to the content wrapper instead of using this component.

## Page integration patterns

### Products page

- Loading: show `lib-spinner` overlay only on the very first load (`!hasLoaded()`).
- After first load: when `isLoading()` is true, replace the cards grid with a grid of `lib-skeleton-card` (same column breakpoints) and keep the filter panel visible.
- When products arrive: apply `.animate-stagger` to the cards grid so cards slide up with stagger.

### Product details

- Loading: full-page `lib-spinner` overlay centered in the details container.
- Content arrives: `.animate-fade-in` on the gallery + info columns.

### Cart

- Loading: `lib-skeleton-list` for cart items; keep summary panel hidden until first item loads.
- Content arrives: `.animate-slide-up` on the cart item list and summary panel.

### Addresses

- Loading: `lib-skeleton-card` per address row in the modal/list.
- Content arrives: `.animate-fade-in` on the address list.

### Wishlist

- Same pattern as products grid.

### Orders

- Loading: `lib-skeleton-list` rows matching order-row height.
- Content arrives: `.animate-slide-up` on the orders table.

## Accessibility

- Skeletons use `aria-hidden="true"` and `aria-busy="true"` on the parent region.
- Spinners already include `.sr-only` text.
- `prefers-reduced-motion` disables entrance animations and converts shimmer to static fill.

## Testing

- Unit tests for skeleton components: render, shimmer class presence, reduced-motion fallback.
- Unit test for animation utilities: CSS class generation.
- Visual regression is not required; manual smoke test in products, cart, addresses, wishlist, orders is sufficient.

## Definition of Done

- [x] New skeleton components exist in `libs/shared/ui`.
- [x] Animation CSS utilities exist in `libs/shared/shared-theme` or `libs/shared/ui`.
- [x] Every in-scope page switches from a plain spinner to the appropriate skeleton/animation pattern.
- [x] Loading state still reads from the existing store signal.
- [x] `npx nx typecheck roseMain` passes.
- [x] `npx nx test shared-ui-components` passes (pre-existing failures unchanged).
- [x] Manual smoke test confirms no layout shift when data arrives.

## Change Log

| Date | Change |
|------|--------|
| 2026-08-17 | Implemented skeleton components, animation utilities, and page loading states |

## Relation to other phases

- Phase 3 delivered the dark-mode color tokens used by skeletons (`--bg-muted`, `--bg-soft`).
- Phase 4 cleanup should finish before this phase starts.
