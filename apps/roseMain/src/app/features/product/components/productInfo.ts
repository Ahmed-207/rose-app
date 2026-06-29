import { DecimalPipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'apps/shared/components/button/button';
import { ProductDetail } from 'apps/shared/models/productDetailDto';

@Component({
  selector: 'product-info',
  imports: [DecimalPipe, TranslatePipe, Button],
  templateUrl: './productInfo.html',
  styleUrl: './productInfo.css',
})
export class ProductInfo {
  readonly product = input.required<ProductDetail>();
  readonly addToCart = output<ProductDetail>();
  readonly wishlistToggle = output<ProductDetail>();

  readonly isWishlist = signal(false);

  onAddToCart(): void {
    const current = this.product();
    if (current.isOutOfStock) return;
    this.addToCart.emit(current);
  }

  onWishlist(): void {
    this.isWishlist.update((value) => !value);
    this.wishlistToggle.emit(this.product());
  }
}
