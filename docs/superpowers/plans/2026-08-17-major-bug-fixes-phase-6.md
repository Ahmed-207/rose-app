# Phase 6 — Major Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two production bugs in `roseMain`: (1) the cart page "Products you may like" add-to-cart flow always fails with "insufficient stock" and replaces the empty-cart UI with an error message, and the same error persists after clearing the cart; (2) the products page product grid temporarily drops below the filter panel while a filter change is loading.

**Architecture:** Surgical fixes to existing components and one shared UI component. No new dependencies. Cart recommended products will reuse the existing shared mapper to preserve stock state; transient add-to-cart failures will rely on the global toast interceptor instead of hijacking the page-level error banner; clearing the cart will reset the page error; the shared product card will disable its add-to-cart button for out-of-stock items everywhere it is used. The products page spinner will be limited to the initial load so it never renders alongside the product container.

**Tech Stack:** Angular 21, Nx, TypeScript, Vitest/Angular testing, Tailwind CSS, RxJS.

**Spec:** This plan implements the fixes designed during the 2026-08-17 bug investigation. It does not have a separate design spec because the scope is bounded and the design was validated in chat.

## Global Constraints

- Use the existing `Product` type from `@org/shared-ui-components` and the existing `mapApiProductToCardProduct()` utility from `apps/roseMain/src/app/shared/utils/map-api-product.ts`.
- All error messages shown to users must use translation keys or existing literal strings already present in the codebase.
- Do not change public component APIs unless necessary; `lib-product-card` must continue emitting `addToCart` for in-stock products.
- Every task ends with a green unit/component test run.
- Commit each task independently with a conventional-commit message.
- The workspace gate `npx nx run-many -t lint test build typecheck` must pass after all tasks.

---

## Task 1: Fix cart page recommended-product mapping and error handling

**Files:**
- Modify: `apps/roseMain/src/app/pages/cart-page/cart-page.ts:27-31` (imports)
- Modify: `apps/roseMain/src/app/pages/cart-page/cart-page.ts:79-91` (`recommended` computed)
- Modify: `apps/roseMain/src/app/pages/cart-page/cart-page.ts:189-207` (`clearCart` method)
- Modify: `apps/roseMain/src/app/pages/cart-page/cart-page.ts:273-283` (`onAddRecommended` method)
- Create: `apps/roseMain/src/app/pages/cart-page/cart-page.spec.ts`

**Interfaces:**
- Consumes: `ProductsStore.bestProducts()` (array of API products), `CartService.addToCart(...)`, `CartService.clearCart()`, `AppToastService.success()`.
- Produces: `recommended` signal of type `Product[]` with correct `isOutOfStock`, `error` signal reset on clear, no error write on `onAddRecommended` failure.

- [ ] **Step 1: Add the shared mapper import**

In `apps/roseMain/src/app/pages/cart-page/cart-page.ts`, after the existing `Product` import, add:

```ts
import { mapApiProductToCardProduct } from '../../shared/utils/map-api-product';
```

- [ ] **Step 2: Replace manual recommended-product mapping**

Replace the `recommended` computed (lines 79-91) with:

```ts
readonly recommended = computed<Product[]>(() => {
  return [...this.productsStore.bestProducts()]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .map(mapApiProductToCardProduct)
    .slice(0, 8);
});
```

- [ ] **Step 3: Reset page error when clearing cart**

In `clearCart()` `next` handler, add `this.error.set(null);` after `this.isClearing.set(false);`:

```ts
this.cartService.clearCart().subscribe({
  next: () => {
    this.items.set([]);
    this.appliedCoupon.set(null);
    this.couponError.set(null);
    this.isClearing.set(false);
    this.error.set(null);
    this.toast.success('toast.CART_CLEARED');
  },
  error: () => {
    this.isClearing.set(false);
  },
});
```

- [ ] **Step 4: Stop hijacking page error on recommended add-to-cart failure**

Replace `onAddRecommended` with:

```ts
onAddRecommended(product: Product): void {
  this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
    next: () => {
      this.toast.success('toast.ADDED_TO_CART');
      this.loadCart();
    },
    error: () => undefined,
  });
}
```

- [ ] **Step 5: Add unit tests for cart-page**

Create `apps/roseMain/src/app/pages/cart-page/cart-page.spec.ts` with:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { ProductsStore } from '@org/products';
import { of, throwError } from 'rxjs';
import { CartPage } from './cart-page';
import { CartService } from './services/cart.service';
import { signal } from '@angular/core';

const mockApiProduct = {
  id: 'p1',
  title: 'Rose',
  price: '100',
  discountValue: '0',
  rating: 4.5,
  ratings: 10,
  stock: 0,
  cover: '/img/rose.jpg',
  createdAt: new Date().toISOString(),
  _count: {},
};

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;
  let cartService: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cartService = jasmine.createSpyObj('CartService', ['getCart', 'addToCart', 'clearCart', 'getCoupons']);
    cartService.getCart.and.returnValue(of({ cartItems: [] }));
    cartService.getCoupons.and.returnValue(of({ data: [] }));
    cartService.addToCart.and.returnValue(of({}));
    cartService.clearCart.and.returnValue(of({ status: true, code: 200 }));

    const productsStore = {
      bestProducts: signal([mockApiProduct]),
      isBestLoading: signal(false),
      loadBestProducts: jasmine.createSpy('loadBestProducts'),
    } as unknown as ProductsStore;

    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CartService, useValue: cartService },
        { provide: ProductsStore, useValue: productsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
  });

  it('should map recommended products with isOutOfStock when stock is zero', () => {
    const recommended = component.recommended();
    expect(recommended.length).toBe(1);
    expect(recommended[0].isOutOfStock).toBe(true);
  });

  it('should not set page error when addToCart fails for a recommended product', () => {
    cartService.addToCart.and.returnValue(throwError(() => new Error('insufficient stock')));
    component.error.set(null);
    component.onAddRecommended(component.recommended()[0]);
    expect(cartService.addToCart).toHaveBeenCalled();
    expect(component.error()).toBeNull();
  });

  it('should reset page error after clearCart succeeds', () => {
    component.error.set('Failed to add product to cart. Please sign in and try again.');
    component.items.set([{ id: 'ci1', product: {} as any, quantity: 1 }]);
    component.clearCart();
    expect(component.error()).toBeNull();
    expect(component.items().length).toBe(0);
  });
});
```

- [ ] **Step 6: Run the new cart-page tests**

Run:

```bash
npx nx test roseMain -- src/app/pages/cart-page/cart-page.spec.ts --run
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/roseMain/src/app/pages/cart-page/cart-page.ts apps/roseMain/src/app/pages/cart-page/cart-page.spec.ts
git commit -m "fix(roseMain): correct cart recommended mapping and clear-cart error state"
```

---

## Task 2: Disable add-to-cart on out-of-stock products in shared product card

**Files:**
- Modify: `libs/shared/ui/src/lib/product-card/product-card.ts:77-80`
- Modify: `libs/shared/ui/src/lib/product-card/product-card.html:114-119`
- Modify: `libs/shared/ui/src/lib/product-card/product-card.spec.ts`

**Interfaces:**
- Consumes: `product().isOutOfStock` via `isOutOfStock()` computed.
- Produces: Disabled add-to-cart button and guarded `addToCart` emit for out-of-stock products.

- [ ] **Step 1: Guard the click handler**

In `libs/shared/ui/src/lib/product-card/product-card.ts`, replace `onAddToCart`:

```ts
onAddToCart(event: Event): void {
  event.stopPropagation();
  if (this.isOutOfStock()) {
    return;
  }
  this.addToCart.emit(this.product());
}
```

- [ ] **Step 2: Disable the button in the template**

In `libs/shared/ui/src/lib/product-card/product-card.html`, update the add-to-cart button:

```html
<button type="button"
  class="add-to-cart w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-900 dark:bg-red-500 rounded-full shrink-0 cursor-pointer hover:bg-red-800 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  [disabled]="isOutOfStock()"
  (click)="onAddToCart($event)">
  <svg lucideShoppingCart [size]="20" class="text-white sm:hidden"></svg>
  <svg lucideShoppingCart [size]="22" class="text-white hidden sm:block"></svg>
</button>
```

- [ ] **Step 3: Add a component test for out-of-stock guard**

Append to `libs/shared/ui/src/lib/product-card/product-card.spec.ts`:

```ts
it('should disable add-to-cart and not emit for out-of-stock product', () => {
  const outOfStockProduct = { ...mockProduct, isOutOfStock: true };
  fixture.componentRef.setInput('product', outOfStockProduct);
  fixture.detectChanges();

  const addSpy = jasmine.createSpy('addToCart');
  component.addToCart.subscribe(addSpy);

  const button = fixture.nativeElement.querySelector('.add-to-cart') as HTMLButtonElement;
  expect(button.disabled).toBe(true);

  button.click();
  expect(addSpy).not.toHaveBeenCalled();
});
```

- [ ] **Step 4: Run the product-card tests**

Run:

```bash
npx nx test shared-ui-components -- src/lib/product-card/product-card.spec.ts --run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add libs/shared/ui/src/lib/product-card/product-card.ts libs/shared/ui/src/lib/product-card/product-card.html libs/shared/ui/src/lib/product-card/product-card.spec.ts
git commit -m "fix(shared-ui-components): disable add-to-cart when product is out of stock"
```

---

## Task 3: Fix products page filter-change layout jump

**Files:**
- Modify: `apps/roseMain/src/app/pages/products-page/products-page.html:10-14`
- Modify: `apps/roseMain/src/app/pages/products-page/products-page.spec.ts`

**Interfaces:**
- Consumes: `isLoading()`, `hasLoaded()`, `error()` signals from `ProductsStore`.
- Produces: Spinner container rendered only on initial load; product/skeleton container renders alone on subsequent filter changes.

- [ ] **Step 1: Change the spinner container condition**

In `apps/roseMain/src/app/pages/products-page/products-page.html`, change line 10 from:

```html
@if((isLoading() || !hasLoaded()) && !error()){
```

to:

```html
@if(!hasLoaded() && !error()){
```

- [ ] **Step 2: Add a component test for mutual exclusivity during refetch**

Append to `apps/roseMain/src/app/pages/products-page/products-page.spec.ts`:

```ts
it('should not render the spinner container while refetching after first load', () => {
  component.isLoading.set(true);
  component.hasLoaded.set(true);
  component.error.set(null);
  component.products.set([{ id: 'p1', name: 'Test', image: 'test.jpg', price: 100 }]);
  fixture.detectChanges();

  const spinner = fixture.nativeElement.querySelector('.spinner-container');
  const productsContainer = fixture.nativeElement.querySelector('.products-container');

  expect(spinner).toBeNull();
  expect(productsContainer).toBeTruthy();
});
```

- [ ] **Step 3: Run the products-page tests**

Run:

```bash
npx nx test roseMain -- src/app/pages/products-page/products-page.spec.ts --run
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/roseMain/src/app/pages/products-page/products-page.html apps/roseMain/src/app/pages/products-page/products-page.spec.ts
git commit -m "fix(roseMain): prevent products grid from wrapping under filter panel on refetch"
```

---

## Final Verification

- [ ] **Step 1: Run the full workspace gate**

```bash
npx nx run-many -t lint test build typecheck
```

Expected: all 15 projects pass.

- [ ] **Step 2: Push the branch**

```bash
git push origin ui-enhancement
```

Expected: remote updated; PR #78 reflects the new commits.
