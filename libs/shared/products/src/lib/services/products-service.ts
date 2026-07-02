import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateReviewReq,
  CreateReviewRes,
  ProductsRes,
  ReviewsRes,
  SingleProductRes,
} from '../models/products-res';

export const PRODUCTS_API_URL = new InjectionToken<string>('PRODUCTS_API_URL', {
  factory: () => 'https://rose-app.elevate-bootcamp.cloud/api/',
});

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = inject(PRODUCTS_API_URL);

  getAllProducts(pageNum: number, pageLimit: number): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`${this.apiURL}products?page=${pageNum}&limit=${pageLimit}`);
  }

  getBestProducts(pageLimit: number): Observable<ProductsRes> {
    return this.getAllProducts(1, pageLimit).pipe(
      map((response) => ({
        ...response,
        payload: {
          ...response.payload,
          data: [...response.payload.data].sort(
            (a, b) =>
              (b._count?.cartItems ?? 0) - (a._count?.cartItems ?? 0) ||
              b.rating - a.rating,
          ),
        },
      })),
    );
  }

  getProductById(id: string): Observable<SingleProductRes> {
    return this.httpClient.get<SingleProductRes>(`${this.apiURL}products/${id}`);
  }

  getProductReviews(productId: string, page = 1, limit = 20): Observable<ReviewsRes> {
    return this.httpClient.get<ReviewsRes>(
      `${this.apiURL}reviews?productId=${productId}&page=${page}&limit=${limit}`,
    );
  }

  createProductReview(review: CreateReviewReq): Observable<CreateReviewRes> {
    return this.httpClient.post<CreateReviewRes>(`${this.apiURL}reviews`, review);
  }


}
