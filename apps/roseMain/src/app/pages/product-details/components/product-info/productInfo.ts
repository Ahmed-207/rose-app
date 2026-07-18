import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideHeartPlus, LucidePackage } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'apps/shared/components/button/button';
import { ProductDetail } from 'apps/shared/models/productDetailDto';

@Component({
  selector: 'product-info',
  imports: [DecimalPipe, TranslatePipe, Button, LucideHeartPlus, LucidePackage],
  templateUrl: './productInfo.html',
  styleUrl: './productInfo.css',
})
export class ProductInfo implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  readonly product = input.required<ProductDetail>();
  readonly addToCart = output<ProductDetail>();
  readonly wishlistToggle = output<ProductDetail>();

  readonly isWishlist = signal(false);

  private galleryResizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const galleryElement = this.host.nativeElement.previousElementSibling;
    if (!(galleryElement instanceof HTMLElement) || !galleryElement.matches('product-gallery')) {
      return;
    }

    const syncGalleryHeight = () => {
      this.host.nativeElement.style.setProperty(
        '--product-gallery-height',
        `${galleryElement.offsetHeight}px`,
      );
    };

    syncGalleryHeight();
    this.galleryResizeObserver = new ResizeObserver(syncGalleryHeight);
    this.galleryResizeObserver.observe(galleryElement);
  }

  ngOnDestroy(): void {
    this.galleryResizeObserver?.disconnect();
  }

  onAddToCart(): void {
    const current = this.product();
    if (current.isOutOfStock) return;
    this.addToCart.emit(current);
  }

  onWishlist(): void {
    this.isWishlist.update((value) => !value);
    this.wishlistToggle.emit(this.product());
  }
}
