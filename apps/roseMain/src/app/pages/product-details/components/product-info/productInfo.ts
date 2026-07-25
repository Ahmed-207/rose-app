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
  DestroyRef,
  Input,
  OnInit,
} from '@angular/core';
import { LucideHeartPlus, LucidePackage } from '@lucide/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Product, WishlistService } from '@org/products';
import { Button } from 'apps/shared/components/button/button';
import { ProductDetail } from 'apps/shared/models/productDetailDto';

@Component({
  selector: 'product-info',
  imports: [DecimalPipe, TranslatePipe, Button, LucidePackage],
  templateUrl: './productInfo.html',
  styleUrl: './productInfo.css',
})
export class ProductInfo implements AfterViewInit, OnDestroy, OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  readonly product = input.required<ProductDetail>();
  readonly addToCart = output<ProductDetail>();
  readonly wishlistToggle = output<ProductDetail>();

  // readonly isWishlist = signal(false);

  private galleryResizeObserver?: ResizeObserver;

  private destroyRef = inject(DestroyRef);

  public wishlistService = inject(WishlistService);
  protected readonly String =String ;
  // @Input() Product!: any;




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

 


   ngOnInit(): void {
this.wishlistService.getLoggedUserWishlist()
    .pipe(takeUntilDestroyed(this.destroyRef))
       .subscribe(
     res => {
      const data = res?.payload || res;
    const ids =  new Set<string>( 
      Array.isArray(data)? data.map((p:any) => String(p._id || p.id ) ):[]);
   
    // this.wishlistIds.set(ids)
  
  })
}

   OnWishlist(productId:string ){
    if(!productId) return;
     if (this.isInWishlist(productId)) {
    this.remveFromWishlist(productId)
  }else{
    this.addToWishlist(productId)
  }
  }


  addToWishlist(productId: string): void {

    this.wishlistService.addProductWishlist(productId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        console.log('Added to wishlist successfully', response);
        
    // this.wishlistService.wishlistIds.set(new Set<string>(response.data));
    this.wishlistService.getLoggedUserWishlist()
         //call getlogged 
        // change signal in getlogged next
        // this.Product.isWishlist = true; 
        this.wishlistToggle.emit(this.product());
      },
      error: (err) => {
        console.error('Error adding to wishlist', err);
      }
    });
  }

   remveFromWishlist(productId: string ): void {

    this.wishlistService.removeProductFromWishlist(productId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        console.log('Removing from wishlist successfully', response);
        
    // this.wishlistIds.set(new Set<string>(response.data));
    this.wishlistService.getLoggedUserWishlist()

        
        // this.Product.isWishlist = false; 
        this.wishlistToggle.emit(this.product());
      },
      error: (err) => {
        console.error('Error removing from wishlist', err);
      }
    });
  }

   isInWishlist(productId:string):boolean{
 return this.wishlistService.wishlistIds().has(productId)
}
}

