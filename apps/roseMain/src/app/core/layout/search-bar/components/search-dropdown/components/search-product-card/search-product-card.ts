import { Component, computed, input, output } from '@angular/core';
import { Product } from '@org/products';

@Component({
  selector: 'app-search-product-card',
  imports: [],
  templateUrl: './search-product-card.html',
  styleUrl: './search-product-card.css',
})
export class SearchProductCard {
  product = input.required<Product>();
  select = output<Product>();

  readonly starsArray = computed(() => {
    const rating = Math.floor(Number(this.product().rating || 0));
    const safeRating = Math.max(0, Math.min(rating, 5));
    return Array(safeRating).fill(0);
  });

  readonly emptyStarsArray = computed(() => {
    const rating = Math.floor(Number(this.product().rating || 0));
    const safeRating = Math.max(0, Math.min(rating, 5));
    return Array(5 - safeRating).fill(0);
  });
}
