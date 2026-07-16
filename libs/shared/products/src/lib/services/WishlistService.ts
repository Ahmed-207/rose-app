import { Token } from './../../../../../../node_modules/clipanion/lib/core.d';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { API_URL } from '@org/auth';
import {  Root } from '../models/i-wishlist';
import { Observable, pipe, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'; 

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  
//create signal property or wishlist array


wishlistIds = signal<Set<string>>(new Set());

wishlistProducts = signal<any[]>([]);

wishlistCount = computed(()=> this.wishlistIds().size);

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = inject(API_URL);
  private cookieService = inject(CookieService);

   getLoggedUserWishlist(): Observable<Root> 
    {
      const token = this.cookieService.get('userToken')
       return this.httpClient.get<Root>(`${this.apiURL}wishlist` ,{
      headers:{
        token: token || ""
      }
    }
       ).pipe(
        tap((res) => {
          const items = res?.payload?.wishlistItems || [];

          const ids = new Set<string>(items.map(item => String(item.productId || item.product?.id || '')))
          this.wishlistIds.set(ids)
          const proucts = items.map(item => item.product);

          this.wishlistProducts.set(proucts)
        })
       )
      
    
      
    };


    addProductWishlist(productId:string): Observable<any> 
    {
       return this.httpClient.post(`${this.apiURL}wishlist` ,
         {
      productId
    },{
      headers:{
        token:localStorage.getItem('userToken') || ""
      }
    }
      ).pipe(
        tap(() => {
          this.wishlistIds.update(prev => {
            const next = new Set(prev);
            next.add(productId);
            return next;
          })
        })
      )
    };

      removeProductFromWishlist(productId:string): Observable<any> 
    {
       return this.httpClient.delete(`${this.apiURL}wishlist/` ,{
      headers:{
        token:localStorage.getItem('userToken') || ""
      },
      body: {
      productId: productId
    }
    }
        
      ).pipe(
        tap(() => {
          this.wishlistIds.update(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          this.wishlistProducts.update(prev => prev.filter(p => p.id !== productId))
        })
      )
        
    }
}
