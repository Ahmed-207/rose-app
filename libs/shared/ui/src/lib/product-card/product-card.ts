import { Component, computed, DestroyRef, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { LucideHeartPlus, LucideShoppingCart } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Product } from './models/productDto';
import { HttpClient } from '@angular/common/http';
// import { WishlistService } from '@org/products';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly httpClient = inject(HttpClient);

  // public wishlistService = inject(WishlistService);
  protected readonly String = String;
  private destroyRef = inject(DestroyRef);

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

  [x: string]: any;
  Product = input<Product>({} as Product)
  item: any;


  // OnWishlist(productId: string) {
  //   if (!productId) return;
  //   if (this.isInWishlist(productId)) {
  //     this.remveFromWishlist(productId)
  //   } else {
  //     this.addToWishlist(productId)
  //   }
  // }

  // addToWishlist(productId: string): void {

  //   this.wishlistService.addProductWishlist(productId)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Added to wishlist successfully', response);

  //         // this.wishlistService.wishlistIds.set(new Set<string>(response.data));
  //         this.wishlistService.getLoggedUserWishlist()
  //         //call getlogged 
  //         // change signal in getlogged next
  //         this.product.isWishlist = true;
  //         this.wishlistToggle.emit(this.product);
  //       },
  //       error: (err) => {
  //         console.error('Error adding to wishlist', err);
  //       }
  //     });
  // }

  // remveFromWishlist(productId: string): void {

  //   this.wishlistService.removeProductFromWishlist(productId)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Removing from wishlist successfully', response);

  //         // this.wishlistIds.set(new Set<string>(response.data));
  //         this.wishlistService.getLoggedUserWishlist()


  //         this.product.isWishlist = false;
  //         this.wishlistToggle.emit(this.product);
  //       },
  //       error: (err) => {
  //         console.error('Error removing from wishlist', err);
  //       }
  //     });
  // }

  // isInWishlist(productId: string): boolean {
  //   return this.wishlistService.wishlistIds().has(productId)
  // }

  // ngOnInit(): void {
  //   this.wishlistService.getLoggedUserWishlist()
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe(
  //       res => {
  //         const data = res?.payload || res;
  //         const ids = new Set<string>(
  //           Array.isArray(data) ? data.map((p: any) => String(p._id || p.id)) : []);

  //         // this.wishlistIds.set(ids)

  //       })


  // }
}