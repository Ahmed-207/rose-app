import { Product as CardProduct } from '@org/shared-ui-components';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
  computed, // ADDED: computed to map product types
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductCard } from '@org/shared-ui-components';
import { Button } from 'apps/shared/components/button/button';
import { CartService } from '../../../cart-page/services/cart.service';
import { ProductsStore } from '@org/products';

@Component({
  selector: 'best-selling-section',
  imports: [TranslatePipe, ProductCard, Button],
  templateUrl: './bestSellingSection.html',
  styleUrl: './bestSellingSection.css',
})
export class BestSellingSection implements OnInit {
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly platformId = inject(PLATFORM_ID);
  readonly _store = inject(ProductsStore);
  private readonly cartService = inject(CartService);
  // bestSellingSection.ts (UPDATED)
  readonly mappedBestProducts = computed<CardProduct[]>(() => {
    return [...this._store.bestProducts()]
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
      }) as unknown as CardProduct)
      // 3. Slice to only show the top 8 best-sellers in the carousel
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
    this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe();
  }

  onWishlistToggle(product: CardProduct): void {
    // product.isWishlist = !product.isWishlist;
  }

}
