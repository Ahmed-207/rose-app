import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
  input
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductsService } from '@org/products';
import { ProductCard } from 'apps/shared/components/product-card/productCard';
import { Product } from 'apps/shared/models/productDto';
import { mapApiProductToCardProduct } from 'apps/roseMain/src/app/features/home/Utils/map-api-product';

@Component({
  selector: 'related-products-section',
  standalone: true,
  imports: [TranslatePipe, ProductCard],
  templateUrl: './relateProductSection.html',
  styleUrl: './relateProductSection.css',
})
export class RelatedProductsSection implements OnInit {
  readonly currentProductId = input.required<number>(); // لاستقبال الـ id الحالي للمنتج لجلب المنتجات الشبيهة به من الـ API

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly productsService = inject(ProductsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadRelatedProducts();
  }

  scroll(direction: 'prev' | 'next'): void {
    const trackRef = this.track();
    if (!trackRef) return;

    const trackEl = trackRef.nativeElement;
    const item = trackEl.querySelector<HTMLElement>('.carousel-item');
    const gap = 24; // نفس قيمة الـ Gap في الـ Tailwind أو الـ CSS الخاص بك
    const amount = (item?.offsetWidth ?? 280) + gap;

    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onAddToCart(_product: Product): void {}

  onWishlistToggle(product: Product): void {
    product.isWishlist = !product.isWishlist;
  }

  private loadRelatedProducts(): void {
    // افترضنا أن الـ Service تحتوي على دالة لجلب المنتجات المرتبطة، يمكنك تعديلها حسب مسميات الـ API لديك
    this.productsService
      .getBestProducts(8) 
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.products.set(response.payload.data.map(mapApiProductToCardProduct));
      });
  }
}