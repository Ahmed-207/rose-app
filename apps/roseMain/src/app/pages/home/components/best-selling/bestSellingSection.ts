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
import { ProductsStore } from '@org/products';
import { Product as CardProduct } from 'apps/shared/models/productDto'; // ADDED: Import the UI card's product type

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

  // UPDATED: Parameter type to match CardProduct
  onAddToCart(product: CardProduct): void { }

  // UPDATED: Parameter type to match CardProduct
  onWishlistToggle(product: CardProduct): void { }
}