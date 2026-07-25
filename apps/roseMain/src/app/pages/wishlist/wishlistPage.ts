import { TranslatePipe } from '@ngx-translate/core';
import { WishlistService } from '@org/products';
import { Component, DestroyRef, inject, input, OnInit, output, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ProductDetail } from 'apps/shared/models/productDetailDto';
import { Product } from '@org/shared-ui-components';
import { EmptyWishlist } from "./components/empty-wishlist/empty-wishlist";


@Component({
  selector: 'app-wishlist-page',
  imports: [TranslatePipe, RouterLink, CommonModule, EmptyWishlist],
  templateUrl: './wishlistPage.html',
  styleUrl: './wishlistPage.css',
})
export class WishlistPage implements OnInit {

  private readonly router = inject(Router);
  readonly addToCart = output<Product>();

  readonly product = input.required<Product>();



  public readonly wishlistService = inject(WishlistService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.getLoggedUserWishlist();


  }
  getLoggedUserWishlist(){
      this.wishlistService.getLoggedUserWishlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe( res =>{
        console.log('WishlistPage Response:', res)
       
        
    })
  }


   removeProductFromWishlist(productId:string){
    this.wishlistService.removeProductFromWishlist(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe( res => {

      console.log(res)
    })
  }


   removeAllProduct(){
    this.wishlistService.removeAllProduct()
      .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe( res => {

      console.log(res)
    })
  }

   

  
}
