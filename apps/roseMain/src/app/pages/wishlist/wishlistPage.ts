import { TranslatePipe } from '@ngx-translate/core';
import { Daum } from './../../../../../../libs/shared/products/src/lib/models/i-wishlist';
import { WishlistService } from './../../../../../../libs/shared/products/src/lib/services/WishlistService';
import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-wishlist-page',
  imports: [TranslatePipe],
  templateUrl: './wishlistPage.html',
  styleUrl: './wishlistPage.css',
})
export class WishlistPage implements OnInit {

  private readonly router = inject(Router);

  wishlistData:WritableSignal<Daum[]> = signal<Daum[]>({} as Daum[]);
 
  private readonly wishlistService = inject(WishlistService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.getLoggedUserWishlist();
  }
  getLoggedUserWishlist(){
      this.wishlistService.getLoggedUserWishlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe( res =>{
        this.wishlistData.set(res.data)
        
    })
  }


   removeProductFromWishlist(productId:string){
    this.wishlistService.removeProductFromWishlist(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe( res => {
      this.wishlistData.set(res.data);
      this.getLoggedUserWishlist();
    // this.wishlistService.NuOfCartItems.next(res.numOfCartItems);

      console.log(res)
    })
  }
}
