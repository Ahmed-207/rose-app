import { Product } from '@org/shared-ui-components';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideChevronLeft,
  LucideChevronRight,
} from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductsStore } from '@org/products';
import { ProductCard } from '@org/shared-ui-components';
import { CartService } from '../cart-page/services/cart.service';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../cart-page/models/cart.models';
import { SectionHeader } from "../home/components/section-header/section-header";

@Component({
  selector: 'app-payment-page',
  imports: [
    TranslatePipe,
    FormsModule,
    ProductCard,
    LucideChevronLeft,
    LucideChevronRight,
    SectionHeader
],
  templateUrl: './paymentPage.html',
  styleUrl: './paymentPage.css',
})
export class PaymentPage {

  private readonly productsStore = inject(ProductsStore);


   readonly recommended = computed<Product[]>(() => {
    return [...this.productsStore.bestProducts()]
      // 1. Sort by rating descending so the highest-rated items are first
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      // 2. Map them to the UI card structure
      .map((p) => ({
        id: p.id,
        name: p.title,
        image: p.cover,
        price: p.price,
        rating: p.rating,
        oldPrice: p.discountValue ? String(Number(p.price) + Number(p.discountValue)) : undefined
      }) as unknown as Product)
      // 3. Slice to only show the top 8 best-sellers in the carousel
      .slice(0, 8);
  });
  readonly isRecommendedLoading = computed(() => this.productsStore.isBestLoading());
  private readonly recommendTrack = viewChild<ElementRef<HTMLElement>>('recommendTrack');
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);



  readonly items = signal<CartItem[]>([]);
   readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

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

    ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadCart();
    this.loadRecommended();
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
    onAddRecommended(product: Product): void {
      this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
        next: () => this.loadCart(),
        error: () => {
          this.error.set('Failed to add product to cart. Please sign in and try again.');
        },
      });
    }
  
    private loadRecommended(): void {
      // Store-driven: ProductsStore.loadBestProducts populates bestProducts,
      // which `recommended` above reads reactively. No local subscribe/signal
      // needed — the store IS the state now.
      this.productsStore.loadBestProducts({ page: 1, limit: 8 });
    }
}
