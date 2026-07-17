import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductsService } from '@org/products';
import { ProductCard } from 'apps/shared/components/product-card/productCard';
import { Button } from 'apps/shared/components/button/button';

import { Product } from '../../../products-page/model/productDto';
import { CartService } from '../../../cart-page/services/cart.service';

@Component({
  selector: 'best-selling-section',
  imports: [TranslatePipe, ProductCard, Button],
  templateUrl: './bestSellingSection.html',
  styleUrl: './bestSellingSection.css',
})
export class BestSellingSection implements OnInit {
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadBestProducts();
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

  onAddToCart(product: Product): void {
    this.cartService.addToCart({ productId: product.id, quantity: 1 }).subscribe();
  }

  onWishlistToggle(_product: Product): void {
    // Wishlist API not wired yet.
  }
  private loadBestProducts(): void {
    this.productsService
      .getBestProducts(8)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.products.set(response.payload.data as Product[]);
      });
  }
}
