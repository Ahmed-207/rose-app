import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  model,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductsService } from '@org/products';
import { Spinner } from '@org/shared-ui-components';
import { ProductDetail } from 'apps/shared/models/productDetailDto';
import { Subscription } from 'rxjs';
import { mapApiProductToDetail } from '../../home/utils/map-api-product';
import { ProductGallery } from '../components/productGallery';
import { ProductInfo } from '../components/productInfo';
import { ProductReviews } from '../components/productReviews';

@Component({
  selector: 'app-product-detail-page',
  imports: [ProductGallery, ProductInfo, ProductReviews, Spinner, TranslatePipe],
  templateUrl: './productDetailPage.html',
  styleUrl: './productDetailPage.css',
})
export class ProductDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly product = signal<ProductDetail | undefined>(undefined);
  readonly selectedImageIndex = model(0);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private subscription?: Subscription;

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

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.productsService.getProductById(id).subscribe({
      next: (response) => {
        const apiProduct = response.payload.product;
        if (!apiProduct) {
          this.error.set('Product not found');
          this.isLoading.set(false);
          return;
        }

        this.product.set(mapApiProductToDetail(apiProduct));
        this.selectedImageIndex.set(0);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load product');
        this.isLoading.set(false);
      },
    });
  }
}
