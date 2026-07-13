

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Button } from '../button/button';
import { Product } from '../../models/productDto';
import { HttpClient } from '@angular/common/http';
import { WishlistService } from '@org/products';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';





@Component({
  selector: 'product-card',
  imports: [CommonModule, RouterLink, TranslatePipe, RatingModule, FormsModule, Button],
  templateUrl: './productCard.html',
  styleUrl: './productCard.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Input() currency = 'EGP';
  @Input() productLink?: (string | number)[];

  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();
  private readonly httpClient = inject(HttpClient);

  private readonly wishlistService = inject(WishlistService);
  private destroyRef = inject(DestroyRef);


  onAddToCart(): void {
    if (this.product.isOutOfStock) return;
    this.addToCart.emit(this.product);
  }

  
   OnWishlist(): void {

    const productId =  (this.product as any)._id || this.product.id;


    this.wishlistService.addProductWishlist(productId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        console.log('Added to wishlist successfully', response);
        
        
        this.product.isWishlist = true; 
        this.wishlistToggle.emit(this.product);
      },
      error: (err) => {
        console.error('Error adding to wishlist', err);
      }
    });
  }
  get discountPercentage(): number {
    if (!this.product.oldPrice) return 0;

    return Math.round(
      ((this.product.oldPrice - this.product.price) /
        this.product.oldPrice) * 100
    );
  }
}
