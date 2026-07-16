import { TranslatePipe } from '@ngx-translate/core';
import { WishlistService } from '@org/products';
import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishlist-page',
  imports: [TranslatePipe,RouterLink, CommonModule],
  templateUrl: './wishlistPage.html',
  styleUrl: './wishlistPage.css',
})
export class WishlistPage implements OnInit {

  private readonly router = inject(Router);

 
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
}
