import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Button } from '../button/button'
import { Product } from '../../models/productDto';



@Component({
  selector: 'product-card',
  imports: [CommonModule,TranslatePipe,RatingModule,FormsModule,Button],
  templateUrl: './productCard.html',
  styleUrl: './productCard.css',
})
export class ProductCard {

  @Input() product!: Product;
  @Input() currency = 'EGP';

  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();

  onAddToCart(): void {
    if (this.product.isOutOfStock) return;
    this.addToCart.emit(this.product);
  }

  onWishlist(): void {
    this.wishlistToggle.emit(this.product);
  }

  get discountPercentage(): number {
    if (!this.product.oldPrice) return 0;

    return Math.round(
      ((this.product.oldPrice - this.product.price) /
        this.product.oldPrice) * 100
    );
  }
}
