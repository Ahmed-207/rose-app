import { TranslatePipe } from '@ngx-translate/core';
import { Daum } from './../../../../../../libs/shared/products/src/lib/models/i-wishlist';
import { WishlistService } from './../../../../../../libs/shared/products/src/lib/services/wishlistService';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-wishlist-page',
  imports: [TranslatePipe],
  templateUrl: './wishlistPage.html',
  styleUrl: './wishlistPage.css',
})
export class WishlistPage implements OnInit {


  wishlistData:WritableSignal<Daum[]> = signal<Daum[]>({} as Daum[]);
 
  private readonly wishlistService = inject(WishlistService);
  // wishlisService:wishlistService = inject(WishlistService);

  ngOnInit(): void {
    this.getLoggedUserWishlist();
  }
  getLoggedUserWishlist(){
      this.wishlistService.getLoggedUserWishlist().subscribe( res =>{
        this.wishlistData.set(res.data)
        
    })
  }
}
