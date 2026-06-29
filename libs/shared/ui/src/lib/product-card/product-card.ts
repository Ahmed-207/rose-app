import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideHeartPlus, LucideShoppingCart } from '@lucide/angular';

@Component({
  selector: 'lib-product-card',
  standalone: true,
  imports: [LucideHeartPlus, LucideShoppingCart],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  productImg = input<string | null | undefined>();
  productName = input<string>();
  productRating = input<string | number>();
  productCurrentPrice = input<string | number>();
  productDiscount = input<string | number>();
  productId = input<string>();

  protected readonly Number = Number;
  private readonly router = inject(Router);

  productOldPrice = computed(() => {
    const currentPrice = Number(this.productCurrentPrice() || 0);
    const discount = Number(this.productDiscount() || 0);

    if (!discount || discount <= 0 || discount >= 100) {
      return currentPrice;
    }

    const calculatedOldPrice = currentPrice / (1 - discount / 100);
    return Math.round(calculatedOldPrice * 100) / 100;
  });

  starsArray = computed(() => {
    const rating = Math.floor(Number(this.productRating() || 0));
    const safeRating = Math.max(0, Math.min(rating, 5));
    return Array(safeRating).fill(0);
  });

  emptyStarsArray = computed(() => {
    const rating = Math.floor(Number(this.productRating() || 0));
    const safeRating = Math.max(0, Math.min(rating, 5));
    return Array(5 - safeRating).fill(0);
  });

  navigateToDetails(): void {
    const id = this.productId();
    if (id) {
      this.router.navigate(['/home/products', id]);
    }
  }
}