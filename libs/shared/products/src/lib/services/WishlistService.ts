import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { API_URL, AuthCookieStorage } from '@org/auth';
import { Observable, tap } from 'rxjs';
import { Root } from '../models/i-wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  wishlistIds = signal<Set<string>>(new Set());
  wishlistProducts = signal<any[]>([]);
  wishlistCount = computed(() => this.wishlistIds().size);

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = inject(API_URL);
  private readonly authCookieStorage = inject(AuthCookieStorage);

  private get token(): string {
    return this.authCookieStorage.getSession()?.token ?? '';
  }

  getLoggedUserWishlist(): Observable<Root> {
    return this.httpClient
      .get<Root>(`${this.apiURL}wishlist`, {
        headers: { token: this.token },
      })
      .pipe(
        tap((res) => {
          const items = res?.payload?.wishlistItems || [];

          const ids = new Set<string>(
            items.map((item) => String(item.productId || item.product?.id || '')),
          );
          this.wishlistIds.set(ids);

          const products = items.map((item) => item.product);
          this.wishlistProducts.set(products);
        }),
      );
  }

  addProductWishlist(productId: string): Observable<any> {
    return this.httpClient
      .post(
        `${this.apiURL}wishlist`,
        { productId },
        { headers: { token: this.token } },
      )
      .pipe(
        tap(() => {
          this.wishlistIds.update((prev) => {
            const next = new Set(prev);
            next.add(productId);
            return next;
          });
        }),
      );
  }

  removeProductFromWishlist(productId: string): Observable<any> {
    return this.httpClient
      .delete(`${this.apiURL}wishlist/`, {
        headers: { token: this.token },
        body: { productId },
      })
      .pipe(
        tap(() => {
          this.wishlistIds.update((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          this.wishlistProducts.update((prev) => prev.filter((p) => p.id !== productId));
        }),
      );
  }
}