

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, input, Input, OnInit, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Button } from '../button/button';
import { Product } from '../../models/productDto';
import { HttpClient } from '@angular/common/http';
import { WishlistService } from '../../../../libs/shared/products/src/lib/services/WishlistService.ts';
import { AppToastService } from '@org/shared-ui-components';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';






@Component({
  selector: 'product-card',
  imports: [CommonModule, RouterLink, TranslatePipe, RatingModule, FormsModule, Button],
  templateUrl: './productCard.html',
  styleUrl: './productCard.css',
})
export class ProductCard  implements OnInit{
  // @Input() product!: Product;
  @Input() product!: Product;

  @Input() currency = 'EGP';
  @Input() productLink?: (string | number)[];

  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();
  private readonly httpClient = inject(HttpClient);

  public wishlistService = inject(WishlistService);
  private readonly toast = inject(AppToastService);
  protected readonly String =String ;
  private destroyRef = inject(DestroyRef);
  // wishlistIds = signal<Set<string>>(new Set<string>());


  onAddToCart(): void {
    if (this.product.isOutOfStock) return;
    this.addToCart.emit(this.product);
  }

  ngOnInit(): void {
this.wishlistService.getLoggedUserWishlist()
    .pipe(takeUntilDestroyed(this.destroyRef))
       .subscribe(
     res => {
      const data = res?.payload || res;
    const ids =  new Set<string>( 
      Array.isArray(data)? data.map((p:any) => String(p._id || p.id ) ):[]);
   
  
  })

  
  }

  [x: string]: any;
  Product=input<Product>({} as Product)
item: any;


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
        this.toast.success('toast.ADDED_TO_WISHLIST');
    this.wishlistService.getLoggedUserWishlist()
        this.product.isWishlist = true; 
        this.wishlistToggle.emit(this.product);
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
        this.toast.success('toast.REMOVED_FROM_WISHLIST');
    this.wishlistService.getLoggedUserWishlist()

        
        this.product.isWishlist = false; 
        this.wishlistToggle.emit(this.product);
      },
      error: (err) => {
        console.error('Error removing from wishlist', err);
      }
    });
  }

  isInWishlist(productId:string):boolean{
 return this.wishlistService.wishlistIds().has(productId)
}
 
 
  get discountPercentage(): number {
    if (!this.product.oldPrice) return 0;

    return Math.round(
      ((this.product.oldPrice - this.product.price) /
        this.product.oldPrice) * 100
    );
  }
}
