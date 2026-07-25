import { isPlatformBrowser } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsStore, FilterParams } from '@org/products';
import { EmptyProducts } from './components/empty-products/empty-products';
import { mapApiProductToCardProduct } from '../../shared/utils/map-api-product';
import { Spinner, Paginator, ProductCard } from "@org/shared-ui-components";
import { CartService } from '../cart-page/services/cart.service';
import { Product } from '@org/shared-ui-components';
import { FilterPanelComponent } from './components/filter-panel/filterPanel';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [FilterPanelComponent, ProductCard, Spinner, Paginator, EmptyProducts],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPageComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsStore = inject(ProductsStore);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly topAnchor = viewChild<ElementRef<HTMLElement>>('topAnchor');

  readonly isLoading = computed(() => this.productsStore.isLoading());
  readonly hasLoaded = computed(() => this.productsStore.hasLoaded());
  readonly error = computed(() => this.productsStore.error());
  readonly totalResults = computed(() => this.productsStore.totalProducts());
  readonly products = computed(() =>
    this.productsStore.entities().map(mapApiProductToCardProduct),
  );

  readonly productsPerPage = computed(() => this.productsStore.activeFilters().limit ?? 12);
  readonly first = signal(0);

  readonly filterResetCounter = signal(0);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const initialFilters = this.readFiltersFromUrl();
    const page = initialFilters.page ?? 1;
    this.first.set((page - 1) * (initialFilters.limit ?? 12));

    this.productsStore.loadProducts(initialFilters);
  }

  filter(filters: FilterParams): void {
    this.first.set(0);
    this.productsStore.applyFilters(filters);
    this.syncUrl({ ...filters, page: 1, limit: this.productsPerPage() });
    this.scrollToTop();
  }

  onPageChange(pageIndex: number): void {
    const limit = this.productsPerPage();
    this.first.set(pageIndex * limit);

    const nextFilters: FilterParams = {
      ...this.productsStore.activeFilters(),
      page: pageIndex + 1,
    };
    this.productsStore.loadProducts(nextFilters);
    this.syncUrl(nextFilters);
    this.scrollToTop();
  }

  onClearFilters(): void {
    this.first.set(0);
    this.productsStore.resetFilters();
    this.syncUrl({ page: 1, limit: this.productsPerPage() });
    this.filterResetCounter.update((n) => n + 1);
    this.scrollToTop();
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
      error: (err) => {
        console.error('Failed to add to cart', err);
      },
    });
  }

  onWishlistToggle(_product: Product): void {
    // Wishlist API not wired yet.
  }

  /**
   * Reads filter state from the current URL's query params. Only includes
   * a field when its raw param string was actually present — parsing an
   * absent param with Number(null) yields 0, which is a valid price/rating
   * value, so we must check presence via params.has(), not just check the
   * parsed number's range, or "no filter set" gets silently rewritten into
   * "price between 0 and 0" and filters out the entire catalog.
   */
  private readFiltersFromUrl(): FilterParams {
    const params = this.route.snapshot.queryParamMap;

    const page = Number(params.get('page'));
    const limit = Number(params.get('limit'));

    const minRating = params.has('minRating') ? Number(params.get('minRating')) : undefined;
    const minPrice = params.has('minPrice') ? Number(params.get('minPrice')) : undefined;
    const maxPrice = params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined;

    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 12,
      categoryId: params.get('categoryId') ?? undefined,
      occasionId: params.get('occasionId') ?? undefined,
      subCategoryId: params.get('subCategoryId') ?? undefined,
      minRating: minRating !== undefined && Number.isFinite(minRating) && minRating > 0 ? minRating : undefined,
      minPrice: minPrice !== undefined && Number.isFinite(minPrice) && minPrice >= 0 ? minPrice : undefined,
      maxPrice: maxPrice !== undefined && Number.isFinite(maxPrice) && maxPrice >= 0 ? maxPrice : undefined,
    };
  }

  private syncUrl(filters: FilterParams): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 12,
        categoryId: filters.categoryId ?? null,
        occasionId: filters.occasionId ?? null,
        subCategoryId: filters.subCategoryId ?? null,
        minRating: filters.minRating ?? null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private scrollToTop(): void {
    this.topAnchor()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}