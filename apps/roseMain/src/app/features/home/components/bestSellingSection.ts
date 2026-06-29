import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductCard } from 'apps/shared/components/product-card/productCard';
import { Button } from 'apps/shared/components/button/button';
import { Product } from 'apps/shared/models/productDto';
import { ProductService } from '../../product/data/product.service';

@Component({
  selector: 'best-selling-section',
  imports: [TranslatePipe, ProductCard, Button],
  templateUrl: './bestSellingSection.html',
  styleUrl: './bestSellingSection.css',
})
export class BestSellingSection {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly productService = inject(ProductService);

  readonly products = this.productService.getProducts();

  scroll(direction: 'prev' | 'next'): void {
    const trackEl = this.track().nativeElement;
    const item = trackEl.querySelector<HTMLElement>('.carousel-item');
    const gap = 24;
    const amount = (item?.offsetWidth ?? 280) + gap;

    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onAddToCart(_product: Product): void {}

  onWishlistToggle(product: Product): void {
    product.isWishlist = !product.isWishlist;
  }
}
