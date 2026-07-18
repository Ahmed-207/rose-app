import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { LucideHeartPlus, LucideShoppingCart } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Product } from './models/productDto';

@Component({
  selector: 'lib-product-card',
  standalone: true,
  imports: [LucideHeartPlus, LucideShoppingCart, TranslatePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();

  readonly addToCart = output<Product>();
  readonly wishlistToggle = output<Product>();

  private readonly router = inject(Router);

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

  navigateToDetails(): void {
    const id = this.product().id;
    if (id) {
      this.router.navigate(['/home/products', id]);
    }
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    this.wishlistToggle.emit(this.product());
  }
}