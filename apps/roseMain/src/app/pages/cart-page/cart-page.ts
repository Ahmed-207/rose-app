import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBrushCleaning,
  LucideChevronLeft,
  LucideChevronRight,
  LucideTicketPercent,
} from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductsStore } from '@org/products';
import { AppToastService, ProductCard, SkeletonListComponent } from '@org/shared-ui-components';
import { CartItemComponent } from './components/cart-item/cart-item';
import { AppliedCoupon, CartItem, Coupon } from './models/cart.models';
import { CartService } from './services/cart.service';
import { Product } from '@org/shared-ui-components';
import { mapApiProductToCardProduct } from '../../shared/utils/map-api-product';
import { Stepper } from "./components/stepper/stepper";
import { ShippingAddress } from './components/addresses/shipping-address';
import { Payment } from "./components/payment/payment";
import { addressStore } from '@org/user-addresses';
import { OrderStore, AddOrderReq } from '@org/user-orders';

@Component({
  selector: 'app-cart-page',
  imports: [
    TranslatePipe,
    FormsModule,
    DecimalPipe,
    CartItemComponent,
    ProductCard,
    SkeletonListComponent,
    LucideBrushCleaning,
    LucideArrowLeft,
    LucideArrowRight,
    LucideTicketPercent,
    LucideChevronLeft,
    LucideChevronRight,
    ShippingAddress,
    Stepper,
    Payment
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage implements OnInit {

  // services & injections
  private readonly cartService = inject(CartService);
  private readonly toast = inject(AppToastService);
  private readonly productsStore = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly orderStore = inject(OrderStore);

  // page-properties
  private readonly recommendTrack = viewChild<ElementRef<HTMLElement>>('recommendTrack');
  readonly items = signal<CartItem[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyItemId = signal<string | null>(null);
  readonly isClearing = signal(false);
  readonly isApplyingCoupon = signal(false);
  readonly recommended = computed<Product[]>(() => {
    return [...this.productsStore.bestProducts()]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .map(mapApiProductToCardProduct)
      .slice(0, 8);
  });
  readonly isRecommendedLoading = computed(() => this.productsStore.isBestLoading());
  readonly couponCode = signal('');
  readonly couponError = signal<string | null>(null);
  readonly appliedCoupon = signal<AppliedCoupon | null>(null);
  private coupons: Coupon[] = [];
  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.items().reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    ),
  );
  readonly discount = computed(() => this.appliedCoupon()?.discountAmount ?? 0);
  readonly total = computed(() => Math.max(0, this.subtotal() - this.discount()));

  // checkout-flow
  pageCurrentState: WritableSignal<string> = signal<string>('Cart');
  readonly _addressStore = inject(addressStore);
  recievedAddressId = computed(() => this._addressStore.lastSelectedAddressId());
  confirmedPaymentMethod: WritableSignal<string> = signal<string>('CASH_ON_DELIVERY');

  // stepper-logic
  readonly totalSteps = 2;
  currentStep: WritableSignal<number> = signal(1);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadCart();
    this.loadRecommended();
    this.loadCoupons();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.cartService
      .getCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set(res.cartItems ?? []);
          this.recalculateAppliedCoupon();
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err?.status === 401) {
            this.error.set('Please sign in to view your cart.');
            return;
          }
          this.error.set('Failed to load cart. Please try again.');
        },
      });
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1 || quantity === item.quantity) {
      return;
    }

    this.busyItemId.set(item.id);
    this.cartService.updateQuantity(item.id, { quantity }).subscribe({
      next: (res) => {
        const updated = res.cartItem;
        this.items.update((list) =>
          list.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        this.recalculateAppliedCoupon();
        this.busyItemId.set(null);
      },
      error: () => {
        this.busyItemId.set(null);
      },
    });
  }

  removeItem(item: CartItem): void {
    this.busyItemId.set(item.id);
    this.cartService.removeItem(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((entry) => entry.id !== item.id));
        this.recalculateAppliedCoupon();
        this.busyItemId.set(null);
        this.toast.success('toast.REMOVED_FROM_CART');
      },
      error: () => {
        this.busyItemId.set(null);
      },
    });
  }

  clearCart(): void {
    if (!this.items().length || this.isClearing()) {
      return;
    }

    this.isClearing.set(true);
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
  }

  applyCoupon(): void {
    const code = this.couponCode().trim().toUpperCase();
    this.couponError.set(null);

    if (!code) {
      this.couponError.set('Please enter a coupon code.');
      return;
    }

    this.isApplyingCoupon.set(true);
    const coupon = this.coupons.find((entry) => entry.code.toUpperCase() === code);

    if (!coupon || !coupon.isActive) {
      this.couponError.set('Invalid or inactive coupon code.');
      this.isApplyingCoupon.set(false);
      return;
    }

    const now = Date.now();
    if (now < new Date(coupon.validFrom).getTime() || now > new Date(coupon.validUntil).getTime()) {
      this.couponError.set('This coupon is not valid at this time.');
      this.isApplyingCoupon.set(false);
      return;
    }

    const discountAmount = this.computeDiscount(coupon, this.subtotal());
    if (discountAmount <= 0) {
      this.couponError.set(
        `Minimum purchase of ${coupon.minPurchase} EGP required for this coupon.`,
      );
      this.isApplyingCoupon.set(false);
      return;
    }

    this.appliedCoupon.set({ coupon, discountAmount });
    this.isApplyingCoupon.set(false);
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponError.set(null);
  }

  continueShopping(): void {
    this.router.navigateByUrl('/home/products');
  }

  scrollRecommended(direction: 'prev' | 'next'): void {
    const trackRef = this.recommendTrack();
    if (!trackRef) {
      return;
    }

    const trackEl = trackRef.nativeElement;
    const item = trackEl.querySelector<HTMLElement>('.carousel-item');
    const gap = 20;
    const amount = (item?.offsetWidth ?? 240) + gap;

    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onAddRecommended(product: Product): void {
    this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
      next: () => {
        this.toast.success('toast.ADDED_TO_CART');
        this.loadCart();
      },
      error: () => undefined,
    });
  }

  private loadRecommended(): void {
    this.productsStore.loadBestProducts({ page: 1, limit: 8 });
  }

  private loadCoupons(): void {
    this.cartService
      .getCoupons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.coupons = res.data ?? [];
        },
      });
  }

  private computeDiscount(coupon: Coupon, subtotal: number): number {
    const minPurchase = Number(coupon.minPurchase) || 0;
    if (subtotal < minPurchase) {
      return 0;
    }

    const value = Number(coupon.value) || 0;
    const maxDiscount = Number(coupon.maxDiscount) || Infinity;
    let discount = 0;

    if (String(coupon.type).toUpperCase() === 'PERCENT') {
      discount = (subtotal * value) / 100;
    } else {
      discount = value;
    }

    return Math.min(discount, maxDiscount, subtotal);
  }

  private recalculateAppliedCoupon(): void {
    const applied = this.appliedCoupon();
    if (!applied) {
      return;
    }

    const discountAmount = this.computeDiscount(applied.coupon, this.subtotal());
    if (discountAmount <= 0) {
      this.appliedCoupon.set(null);
      return;
    }

    this.appliedCoupon.set({ coupon: applied.coupon, discountAmount });
  }

  // checkout-flow methods
  checkout(): void {
    if (this.items().length) {
      this.pageCurrentState.set('Shipping Address');
    }
  }

  goToPayment(): void {
    if (!this.recievedAddressId()) {
      return;
    }
    this.nextStep();
    this.pageCurrentState.set('Payment Method');
  }

  handleOrderCreation(): void {
    if (this.orderStore.isLoading()) return;
    const addressId = this.recievedAddressId();
    if (!addressId) return;

    const payload: AddOrderReq = {
      addressId,
      paymentMethod: this.confirmedPaymentMethod(),
      couponCode: this.appliedCoupon()?.coupon.code,
    };

    this.orderStore.createOrder(payload);
   
    // this.router.navigateByUrl('/home/orders');
  }

  // stepper-logic
  onStepperNodeClick(step: number): void {
    this.currentStep.set(step);
  }

  goBackToShipping(): void {
    this.prevStep();
    this.pageCurrentState.set('Shipping Address');
  }

  nextStep(): void {
    this.currentStep.set(2);
    return;
  }

  prevStep(): void {
    this.currentStep.set(1);
  }
}
