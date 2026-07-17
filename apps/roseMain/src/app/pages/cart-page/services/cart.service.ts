import { API_URL } from '@org/auth';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  AddToCartReq,
  CartItem,
  CartItemRes,
  CartRes,
  CouponsRes,
  UpdateCartItemReq,
} from '../models/cart.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiURL = inject(API_URL);

  /** Total quantity of all items in the cart (shared across navbar + pages). */
  readonly itemCount = signal(0);

  getCart(): Observable<CartRes> {
    return this.http.get<CartRes>(`${this.apiURL}cart`).pipe(
      tap({
        next: (res) => this.applyItems(res.payload?.cartItems ?? []),
        error: () => this.itemCount.set(0),
      }),
    );
  }

  addToCart(body: AddToCartReq): Observable<CartItemRes> {
    return this.http.post<CartItemRes>(`${this.apiURL}cart`, body).pipe(
      tap({
        next: () => this.refreshCount(),
        error: () => undefined,
      }),
    );
  }

  updateQuantity(cartItemId: string, body: UpdateCartItemReq): Observable<CartItemRes> {
    return this.http.patch<CartItemRes>(`${this.apiURL}cart/${cartItemId}`, body).pipe(
      tap({
        next: () => this.refreshCount(),
        error: () => undefined,
      }),
    );
  }

  removeItem(cartItemId: string): Observable<{ status: boolean; code: number; message?: string }> {
    return this.http
      .delete<{ status: boolean; code: number; message?: string }>(`${this.apiURL}cart/${cartItemId}`)
      .pipe(
        tap({
          next: () => this.refreshCount(),
          error: () => undefined,
        }),
      );
  }

  clearCart(): Observable<{ status: boolean; code: number; message?: string }> {
    return this.http
      .delete<{ status: boolean; code: number; message?: string }>(`${this.apiURL}cart`)
      .pipe(
        tap({
          next: () => this.itemCount.set(0),
          error: () => undefined,
        }),
      );
  }

  getCoupons(): Observable<CouponsRes> {
    return this.http.get<CouponsRes>(`${this.apiURL}coupons`);
  }

  refreshCount(): void {
    this.getCart().subscribe({ error: () => this.itemCount.set(0) });
  }

  private applyItems(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.itemCount.set(total);
  }
}
