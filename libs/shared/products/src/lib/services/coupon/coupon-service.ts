import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICouponResponse, ICouponsPaginatedResponse } from '../../models/i-coupon';
import { API_URL } from '@org/auth';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {
  private readonly http = inject(HttpClient);

  private readonly apiURL = inject(API_URL);

  getAllCoupons(page = 1, limit = 10): Observable<ICouponsPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ICouponsPaginatedResponse>(`${this.apiURL}coupons`, { params });
  }

  getCouponById(id: string): Observable<ICouponResponse> {
    return this.http.get<ICouponResponse>(`${this.apiURL}coupons/${id}`);
  }
}
