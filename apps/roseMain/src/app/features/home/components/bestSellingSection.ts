import { Component, ElementRef, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductCard } from 'apps/shared/components/product-card/productCard';
import { Button } from 'apps/shared/components/button/button';
import { Product } from 'apps/shared/models/productDto';

@Component({
  selector: 'best-selling-section',
  imports: [TranslatePipe, ProductCard, Button],
  templateUrl: './bestSellingSection.html',
  styleUrl: './bestSellingSection.css',
})
export class BestSellingSection {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly products: Product[] = [
    {
      id: 1,
      name: 'Dreamy White Roses Bouquet',
      image: '/assets/images/product.png',
      price: 250,
      oldPrice: 350,
      rating: 4,
      badges: ['NEW'],
    },
    {
      id: 2,
      name: 'Fuchsia Brilliance Vase',
      image: '/assets/images/product.png',
      price: 199,
      oldPrice: 280,
      rating: 3,
      isOutOfStock: true,
    },
    {
      id: 3,
      name: 'Moko Chocolate Set | Esperance...',
      image: '/assets/images/product.png',
      price: 320,
      oldPrice: 400,
      rating: 4,
      badges: ['HOT'],
      isOutOfStock: true,
    },
    {
      id: 4,
      name: 'Classic Red Roses Box',
      image: '/assets/images/product.png',
      price: 275,
      oldPrice: 330,
      rating: 5,
      badges: ['SALE'],
    },
  ];

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
