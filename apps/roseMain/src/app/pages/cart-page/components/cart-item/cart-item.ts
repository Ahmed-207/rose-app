import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideTrash2 } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingModule } from 'primeng/rating';
import { CartItem } from '../../models/cart.models';

@Component({
  selector: 'app-cart-item',
  imports: [TranslatePipe, RouterLink, RatingModule, FormsModule, DecimalPipe, LucideTrash2],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css',
})
export class CartItemComponent {
  readonly item = input.required<CartItem>();
  readonly busy = input(false);

  readonly quantityChange = output<number>();
  readonly remove = output<void>();

  get unitPrice(): number {
    return Number(this.item().product.price) || 0;
  }

  decrease(): void {
    const next = this.item().quantity - 1;
    if (next >= 1) {
      this.quantityChange.emit(next);
    }
  }

  increase(): void {
    const stock = this.item().product.stock ?? Infinity;
    const next = this.item().quantity + 1;
    if (next <= stock) {
      this.quantityChange.emit(next);
    }
  }

  onInputChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(value) || value < 1) {
      return;
    }
    const stock = this.item().product.stock ?? value;
    this.quantityChange.emit(Math.min(value, stock));
  }
}
