import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal, } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Category, ProductsService } from '@org/products';
import { ProductCard } from 'apps/shared/components/product-card/productCard';
import { Product } from 'apps/shared/models/productDto';
import { mapApiProductToCardProduct } from '../../../../shared/utils/map-api-product';

@Component({
  selector: 'most-popular-section',
  imports: [TranslatePipe, ProductCard],
  templateUrl: './mostPopularSection.html',
  styleUrl: './mostPopularSection.css',
})
export class MostPopularSection implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  filters: any;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadPopularProducts();
    this.loadCategories();
  }



  onAddToCart(_product: Product): void { }

  onWishlistToggle(product: Product): void {
    product.isWishlist = !product.isWishlist;
  }

  // private loadPopularProducts(): void {
  //   this.isLoading.set(true);
  //   this.error.set(null);

  //   this.productsService.getAllProducts(1 ,12).subscribe({
  //     next: (response)  => {
  //       this.products.set(response.payload.data.map(mapApiProductToCardProduct));
  //       this.isLoading.set(false);
  //     },
  //     error: () => {
  //       this.error.set('Failed to load most popular products');
  //       this.isLoading.set(false);
  //     },
  //   });
  // }

  private loadPopularProducts(): void {
    this.productsService
      .getAllProducts(1, 12)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products.set(response.payload.data.map(mapApiProductToCardProduct));
        },
        error: (err) => {
          console.error('Error loading popular products', err);
        }
      });
  }

  private loadCategories(): void {
    this.productsService
      .getAllcatigories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {

          this.categories.set(response.payload.data.slice(0,5));
        },
        error: (err) => {
          // console.error('Error loading categories', err);
        }
      });
  }



  readonly activeFilter = signal<string>('All');

  changeFilter(filterName: string, event: Event): void {
    event.preventDefault();
    this.activeFilter.set(filterName);
  }
}