import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductsService } from '@org/products';
import { AppToastService, ProductCard } from '@org/shared-ui-components';
import { Product } from '@org/shared-ui-components';
import { mapApiProductToCardProduct } from '../../../../shared/utils/map-api-product';
import { CartService } from '../../../cart-page/services/cart.service';
import { catchError, filter, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-related-products-section',
  standalone: true,
  imports: [TranslatePipe, ProductCard],
  templateUrl: './relateProductSection.html',
  styleUrl: './relateProductSection.css',
})
export class RelatedProductsSection {
  readonly currentProductId = input.required<string>();

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly toast = inject(AppToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);

  constructor() {
    toObservable(this.currentProductId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((productId): productId is string => !!productId && isPlatformBrowser(this.platformId)),
        switchMap((productId) =>
          this.productsService.getRelatedProducts(productId, 8).pipe(
            catchError((err) => {
              console.error('Failed to load related products', err);
              return of({ data: [], metadata: { page: 1, limit: 0, total: 0, totalPages: 0 } });
            }),
          ),
        ),
      )
      .subscribe((response) => {
        this.products.set(response.data.map(mapApiProductToCardProduct));
      });
  }

  scroll(direction: 'prev' | 'next'): void {
    const trackRef = this.track();
    if (!trackRef) return;

    const trackEl = trackRef.nativeElement;
    const item = trackEl.querySelector<HTMLElement>('.carousel-item');
    const gap = 24;
    const amount = (item?.offsetWidth ?? 280) + gap;

    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
      next: () => this.toast.success('toast.ADDED_TO_CART'),
    });
  }


  onWishlistToggle(_product: Product): void {
    // Wishlist API not wired yet.
  }
}
