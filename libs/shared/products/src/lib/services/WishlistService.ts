import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { API_URL } from '@org/auth';
import { catchError, Observable, tap } from 'rxjs';
import { Root } from '../models/i-wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  wishlistIds = signal<Set<string>>(new Set());
  wishlistProducts = signal<any[]>([]);
  wishlistCount = computed(() => this.wishlistIds().size);
  isLoading = signal<boolean>(false);
  hasLoaded = signal<boolean>(false);

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = inject(API_URL);

  getLoggedUserWishlist(): Observable<Root> {
    this.isLoading.set(true);
    return this.httpClient
      .get<Root>(`${this.apiURL}wishlist`)
      .pipe(
        tap((res) => {
          const items = res?.payload?.wishlistItems || [];

          const ids = new Set<string>(
            items.map((item) => String(item.productId || item.product?.id || '')),
          );
          this.wishlistIds.set(ids);

          const products = items.map((item) => item.product);
          this.wishlistProducts.set(products);

          this.isLoading.set(false);
          this.hasLoaded.set(true);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          this.hasLoaded.set(true);
          throw error;
        }),
      );
  }

  addProductWishlist(productId: string): Observable<any> {
    return this.httpClient
      .post(`${this.apiURL}wishlist`, { productId })
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


  removeAllProduct(): Observable<any> {
    return this.httpClient
      .delete(`${this.apiURL}wishlist`)
      .pipe(
        tap(() => {
          this.wishlistIds.set(new Set());
          
          this.wishlistProducts.set([]);
        }),
      );
  }

}