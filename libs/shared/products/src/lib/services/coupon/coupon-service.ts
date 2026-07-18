import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICoupon, ICouponResponse, ICouponsPaginatedResponse } from '../../models/i-coupon';
import { API_URL } from '@org/auth';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {
  private readonly http = inject(HttpClient);

  private readonly apiURL = inject(API_URL);
  
  getAllCoupons(page: number = 1, limit: number = 10): Observable<ICouponsPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ICouponsPaginatedResponse>(`${this.apiURL}coupons`, { params });
  }

  
  createCoupon(couponData: ICoupon): Observable<ICouponResponse> {
    return this.http.post<ICouponResponse>(`${this.apiURL}coupons`, couponData);
  }

  
  getCouponById(id: string): Observable<ICouponResponse> {
    return this.http.get<ICouponResponse>(`${this.apiURL}coupons/${id}`);
  }

  
  updateCoupon(id: string, couponData: Partial<ICoupon>): Observable<ICouponResponse> {
    return this.http.patch<ICouponResponse>(`${this.apiURL}coupons/${id}`, couponData);
  }

  
  deleteCoupon(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiURL}coupons/${id}`);
  }
}