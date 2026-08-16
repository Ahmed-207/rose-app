import { isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ProductsService, CategoriesStore } from '@org/products';
import { Product } from '@org/shared-ui-components';
import { SectionHeader } from '../section-header/section-header';
import { AppToastService, ProductCard } from '@org/shared-ui-components';
import { mapApiProductToCardProduct } from '../../../../shared/utils/map-api-product';
import { CartService } from '../../../cart-page/services/cart.service';

@Component({
  selector: 'most-popular-section',
  imports: [TranslatePipe, ProductCard, SectionHeader],
  templateUrl: './mostPopularSection.html',
  styleUrl: './mostPopularSection.css',
})
export class MostPopularSection implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly toast = inject(AppToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  readonly categoriesStore = inject(CategoriesStore);
  readonly categories = computed(() => this.categoriesStore.entities().filter((c) => c._count.products !== 0));

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeFilter = signal<string>('All');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.categoriesStore.loadOnce();
    this.loadProducts();
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
      next: () => this.toast.success('toast.ADDED_TO_CART'),
    });
  }

  onWishlistToggle(_product: Product): void {
    // Wishlist API not wired yet.
  }

  changeFilter(filterLabel: string, event: Event): void {
    event.preventDefault();
    this.activeFilter.set(filterLabel);

    const categoryId =
      filterLabel === 'All'
        ? undefined
        : this.categoriesStore.entities().find((c) => c.title === filterLabel)?.id;

    this.loadProducts(categoryId);
  }

  private loadProducts(categoryId?: string): void {
    this.isLoading.set(true);
    this.productsService
      .getAllProducts({ page: 1, limit: 12, categoryId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products.set(response.data.map(mapApiProductToCardProduct));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading popular products', err);
          this.error.set('Failed to load products');
          this.isLoading.set(false);
        },
      });
  }

  goToProductsPage(): void {
    this.router.navigateByUrl('/home/products');
  }

  isFilterMenuOpen = signal(false);

  toggleFilterMenu(): void {
    this.isFilterMenuOpen.update((v) => !v);
  }

  closeFilterMenu(): void {
    this.isFilterMenuOpen.set(false);
  }
}
