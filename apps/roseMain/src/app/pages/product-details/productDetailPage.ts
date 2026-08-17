import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  model,
  OnInit,
  PLATFORM_ID,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '@org/products';
import { AppToastService, SkeletonComponent, Spinner } from '@org/shared-ui-components';
import { ProductDetail } from 'apps/shared/models/productDetailDto';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { mapApiProductToDetail } from '../../shared/utils/map-api-product';
import { CartService } from '../cart-page/services/cart.service';
import { ProductGallery } from './components/product-gallery/productGallery';
import { ProductInfo } from './components/product-info/productInfo';
import { ProductReviews } from './components/product-review/productReviews';
import { RelatedProductsSection } from './components/related-products/relateProductSection';

@Component({
  selector: 'app-product-detail-page',
  imports: [ProductGallery, ProductInfo, ProductReviews, RelatedProductsSection, Spinner, SkeletonComponent],
  templateUrl: './productDetailPage.html',
  styleUrl: './productDetailPage.css',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly toast = inject(AppToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<ProductDetail | undefined>(undefined);
  readonly selectedImageIndex = model(0);
  productId: WritableSignal<string> = signal<string>('');
  readonly isLoading = signal(false);
  readonly hasLoaded = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            void this.router.navigate(['/home']);
            return EMPTY;
          }

          this.productId.set(id);
          this.product.set(undefined);
          this.isLoading.set(true);
          this.hasLoaded.set(false);
          return this.productsService.getProductById(id).pipe(
            catchError((err) => {
              console.error('HTTP error loading product:', err);
              this.isLoading.set(false);
              this.hasLoaded.set(true);
              return EMPTY;
            }),
          );
        }),
      )
      .subscribe((response) => {
        const apiProduct = response.product;
        if (!apiProduct) {
          console.error('No product found in response, redirecting home');
          this.isLoading.set(false);
          void this.router.navigate(['/home']);
          return;
        }

        this.product.set(mapApiProductToDetail(apiProduct));
        this.selectedImageIndex.set(0);
        this.isLoading.set(false);
        this.hasLoaded.set(true);
      });
  }

  onAddToCart(product: ProductDetail): void {
    this.cartService
      .addToCart({ productId: String(product.id), quantity: 1 })
      .subscribe({
        next: () => this.toast.success('toast.ADDED_TO_CART'),
      });
  }

  onWishlistToggle(_product: ProductDetail): void {
    // Wishlist API not wired yet.
  }

  onReviewAdded(review: ProductDetail['reviews'][number]): void {
    this.product.update((product) => {
      if (!product) {
        return product;
      }

      const reviews = [review, ...product.reviews];
      const rating = reviews.reduce((total, item) => total + item.rating, 0) / reviews.length;

      return {
        ...product,
        rating: Math.round(rating),
        reviewCount: product.reviewCount + 1,
        reviews,
      };
    });
  }
}
