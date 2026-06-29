import { Component, effect, inject, model, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ProductGallery } from '../components/productGallery';
import { ProductInfo } from '../components/productInfo';
import { ProductReviews } from '../components/productReviews';
import { ProductService } from '../data/product.service';
import { ProductDetail } from 'apps/shared/models/productDetailDto';

@Component({
  selector: 'app-product-detail-page',
  imports: [ProductGallery, ProductInfo, ProductReviews],
  templateUrl: './productDetailPage.html',
  styleUrl: './productDetailPage.css',
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 },
  );

  readonly product = signal<ProductDetail | undefined>(undefined);
  readonly selectedImageIndex = model(0);

  constructor() {
    effect(() => {
      const id = this.productId();
      if (!id) return;

      const detail = this.productService.getProductById(id);
      if (!detail) {
        void this.router.navigate(['/home']);
        return;
      }

      this.product.set(detail);
      this.selectedImageIndex.set(0);
    });
  }
}
