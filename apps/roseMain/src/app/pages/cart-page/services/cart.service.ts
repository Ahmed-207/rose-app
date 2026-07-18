import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { APICallerService, CART, COUPON } from '@org/products';
import {
  AddToCartReq,
  CartItem,
  CartItemPayload,
  CartPayload,
  CouponsPayload,
  UpdateCartItemReq,
} from '../models/cart.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly api = inject(APICallerService);

  /** Total quantity of all items in the cart (shared across navbar + pages). */
  readonly itemCount = signal(0);

  getCart(): Observable<CartPayload> {
    return this.api.get<CartPayload>(CART.getCart).pipe(
      tap({
        next: (payload) => this.applyItems(payload?.cartItems ?? []),
        error: () => this.itemCount.set(0),
      }),
    );
  }

  addToCart(body: AddToCartReq): Observable<CartItemPayload> {
    return this.api.post<CartItemPayload>(CART.getCart, body).pipe(
      tap({
        next: () => this.refreshCount(),
        error: () => undefined,
      }),
    );
  }

  updateQuantity(cartItemId: string, body: UpdateCartItemReq): Observable<CartItemPayload> {
    return this.api.patch<CartItemPayload>(CART.item(cartItemId), body).pipe(
      tap({
        next: () => this.refreshCount(),
        error: () => undefined,
      }),
    );
  }

  removeItem(cartItemId: string): Observable<{ status: boolean; code: number; message?: string }> {
    return this.api.delete<{ status: boolean; code: number; message?: string }>(CART.item(cartItemId)).pipe(
      tap({
        next: () => this.refreshCount(),
        error: () => undefined,
      }),
    );
  }

  clearCart(): Observable<{ status: boolean; code: number; message?: string }> {
    return this.api.delete<{ status: boolean; code: number; message?: string }>(CART.clearCart).pipe(
      tap({
        next: () => this.itemCount.set(0),
        error: () => undefined,
      }),
    );
  }

  getCoupons(): Observable<CouponsPayload> {
    return this.api.get<CouponsPayload>(COUPON.getCoupons);
  }

  refreshCount(): void {
    this.getCart().subscribe({ error: () => this.itemCount.set(0) });
  }

  private applyItems(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.itemCount.set(total);
  }
}
