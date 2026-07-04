import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  model,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '@org/products';
import { ProductDetail } from 'apps/shared/models/productDetailDto';
import { mapApiProductToDetail } from '../../shared/utils/map-api-product';
import { ProductGallery } from './components/product-gallery/productGallery';
import { ProductInfo } from './components/product-info/productInfo';
import { ProductReviews } from './components/product-review/productReviews';

@Component({
  selector: 'app-product-detail-page',
  imports: [ProductGallery, ProductInfo, ProductReviews],
  templateUrl: './productDetailPage.html',
  styleUrl: './productDetailPage.css',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<ProductDetail | undefined>(undefined);
  readonly selectedImageIndex = model(0);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/home']);
      return;
    }

    this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.productsService.getProductById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        console.log('RAW API RESPONSE:', response); // TEMP DEBUG

        const apiProduct = response.payload?.product;
        if (!apiProduct) {
          console.error('No product found in response, redirecting home');
          void this.router.navigate(['/home']);
          return;
        }

        this.product.set(mapApiProductToDetail(apiProduct));
        this.selectedImageIndex.set(0);
      },
      error: (err) => console.error('HTTP error loading product:', err),
    });
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
