import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@org/auth';
import {  wishlistResponse } from '../models/i-wishlist';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = inject(API_URL);

   getLoggedUserWishlist(): Observable<wishlistResponse> 
    {
       return this.httpClient.get<wishlistResponse>(`$${this.apiURL}wishlist` 
      )
    }
}
