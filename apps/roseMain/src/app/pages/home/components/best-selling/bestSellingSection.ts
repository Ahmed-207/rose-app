import { Product as CardProduct } from '@org/shared-ui-components';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
  computed,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppToastService, ProductCard } from '@org/shared-ui-components';
import { Button } from 'apps/shared/components/button/button';
import { CartService } from '../../../cart-page/services/cart.service';
import { ProductsStore } from '@org/products';
import { mapApiProductToCardProduct } from '../../../../shared/utils/map-api-product';

@Component({
  selector: 'best-selling-section',
  imports: [TranslatePipe, ProductCard, Button],
  templateUrl: './bestSellingSection.html',
  styleUrl: './bestSellingSection.css',
})
export class BestSellingSection implements OnInit {
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cartService = inject(CartService);
  private readonly toast = inject(AppToastService);
  readonly _store = inject(ProductsStore);
  // bestSellingSection.ts (UPDATED)
  readonly mappedBestProducts = computed<CardProduct[]>(() => {
    return [...this._store.bestProducts()]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .map(mapApiProductToCardProduct)
      .slice(0, 8);
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this._store.loadBestProducts({ page: 1, limit: 20 });
  }

  scroll(direction: 'prev' | 'next'): void {
    const trackRef = this.track();
    if (!trackRef) {
      return;
    }

    const trackEl = trackRef.nativeElement;
    const item = trackEl.querySelector<HTMLElement>('.carousel-item');
    const gap = 24;
    const amount = (item?.offsetWidth ?? 280) + gap;

    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onAddToCart(product: CardProduct): void {
    this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
      next: () => this.toast.success('toast.ADDED_TO_CART'),
    });
  }

  onWishlistToggle(product: CardProduct): void {
    // product.isWishlist = !product.isWishlist;
  }

}
