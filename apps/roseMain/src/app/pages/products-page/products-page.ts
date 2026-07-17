import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ProductsStore, FilterParams } from '@org/products';
import { FilterPanelComponent } from './components/filterPanel';
import { mapApiProductToCardProduct } from '../../shared/utils/map-api-product';
import { Spinner, Paginator, ProductCard } from '@org/shared-ui-components';
import { Product } from 'apps/shared/models/productDto';
import { CartService } from '../cart-page/services/cart.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [FilterPanelComponent, ProductCard, Spinner, Paginator],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPageComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsStore = inject(ProductsStore);
  private readonly cartService = inject(CartService);

  readonly isLoading = computed(() => this.productsStore.isLoading());
  readonly error = computed(() => this.productsStore.error());
  readonly totalResults = computed(() => this.productsStore.totalProducts());
  readonly products = computed(() =>
    this.productsStore.entities().map(mapApiProductToCardProduct),
  );

  readonly productsPerPage = computed(() => this.productsStore.activeFilters().limit ?? 12);
  readonly first = signal(0);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.productsStore.loadProducts({ page: 1, limit: 12 });
  }

  filter(filters: FilterParams): void {
    this.first.set(0);
    this.productsStore.applyFilters(filters);
  }

  onPageChange(pageIndex: number): void {
    const limit = this.productsPerPage();
    this.first.set(pageIndex * limit);
    this.productsStore.loadProducts({
      ...this.productsStore.activeFilters(),
      page: pageIndex + 1,
    });
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({ productId: String(product.id), quantity: 1 }).subscribe({
      error: (err) => {
        console.error('Failed to add to cart', err);
      },
    });
  }

  onWishlistToggle(_product: Product): void {
    // Wishlist API not wired yet.
  }
}
