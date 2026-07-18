import { Component, computed, DestroyRef, inject, OnInit, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideHeartPlus, LucideShoppingCart } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthCookieStorage } from '@org/auth';
import { WishlistService } from '@org/products';
import { Product } from '@org/shared-ui-components';

@Component({
  selector: 'lib-product-card',
  standalone: true,
  imports: [LucideHeartPlus, LucideShoppingCart, TranslatePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnInit {
  readonly product = input.required<Product>();

  readonly addToCart = output<Product>();
  readonly wishlistToggle = output<Product>();

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly wishlistService = inject(WishlistService);
  private readonly authCookieStorage = inject(AuthCookieStorage);

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

  readonly isInWishlist = computed(() =>
    this.wishlistService.wishlistIds().has(this.product().id),
  );

  readonly showSignInPrompt = signal(false);

  ngOnInit(): void {
    if (!this.authCookieStorage.getSession()?.token) {
      return;
    }

    this.wishlistService
      .getLoggedUserWishlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.error('Failed to load wishlist', err),
      });
  }

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

    const productId = this.product().id;
    if (!productId) return;

    if (!this.authCookieStorage.getSession()?.token) {
      this.showSignInPrompt.set(true);
      return;
    }

    const action$ = this.isInWishlist()
      ? this.wishlistService.removeProductFromWishlist(productId)
      : this.wishlistService.addProductWishlist(productId);

    action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.wishlistToggle.emit(this.product()),
      error: (err) => console.error('Failed to update wishlist', err),
    });
  }

  goToSignIn(event: Event): void {
    event.stopPropagation();
    this.showSignInPrompt.set(false);
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  dismissSignInPrompt(event: Event): void {
    event.stopPropagation();
    this.showSignInPrompt.set(false);
  }
}