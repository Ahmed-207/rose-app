
import { Component, inject, OnInit, signal } from '@angular/core';
import {  Spinner, Paginator } from "@org/shared-ui-components";
import { ActivatedRoute, Router } from "@angular/router";
import { FilterPanelComponent } from "./components/filterPanel";
import { FilterParams } from "./model/FilterDto";
import { catchError, of, switchMap, tap } from "rxjs";
import { ProductService } from "./services/product-service";
import { ProductCard } from 'apps/shared/components/product-card/productCard';
import { Product } from './model/productDto';

@Component({
  selector: 'app-products-page',
  imports: [ProductCard, Spinner, Paginator,FilterPanelComponent],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
 private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  currentPage = signal<number>(1);
  first = signal<number>(0);
  productsPerPage = signal<number>(4);
  currentFilter = signal<FilterParams>({});

  products = signal<Product[]>([]);
  totalResults = signal<number>(0);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.error.set(null);
        }),
        switchMap((params) => {
          const page = params['page'] ? parseInt(params['page'], 10) : 1;

          const filter: FilterParams = {
            page,
            limit: this.productsPerPage(),
            categoryId: params['categoryId'] || undefined,
            occasionId: params['occasionId'] || undefined,
            subCategoryId: params['subCategoryId'] || undefined,
            minRating: params['minRating'] ? Number(params['minRating']) : undefined,
            minPrice: params['minPrice'] ? Number(params['minPrice']) : undefined,
            maxPrice: params['maxPrice'] ? Number(params['maxPrice']) : undefined,
          };

          this.currentPage.set(page);
          this.first.set((page - 1) * this.productsPerPage());
          this.currentFilter.set(filter);

          // switchMap cancels any in-flight request when a new one comes in,
          // so a slow response for an old page/filter can't overwrite newer data
          return this.productService.getProducts(filter).pipe(
            catchError((err) => {
              console.error('Failed to load products', err);
              this.error.set('Failed to load products. Please try again.');
              return of(null);
            }),
          );
        }),
      )
      .subscribe((response) => {
        this.isLoading.set(false);

        if (!response) {
          return;
        }

        this.products.set(response.data ?? []);
        this.totalResults.set(response.metadata?.total ?? 0);
      });
  }

  filter(filterParam: FilterParams): void {
  
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: 1,
        categoryId: filterParam.categoryId ?? null,
        occasionId: filterParam.occasionId ?? null,
        subCategoryId: filterParam.subCategoryId ?? null,
        minRating: filterParam.minRating ?? null,
        minPrice: filterParam.minPrice ?? null,
        maxPrice: filterParam.maxPrice ?? null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onAddToCart(product: Product): void {
    // TODO: wire up to your cart service/store once it's available.
    console.log('Add to cart', product);
  }

  onWishlistToggle(product: Product): void {
    // TODO: wire up to your wishlist service/store once it's available.
    console.log('Toggle wishlist', product);
  }

}

