import { API_URL } from '@org/auth';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category, CreateReviewReq, CreateReviewRes, ProductsRes, ReviewsRes, SingleProductRes } from '../models/products-res';
import { CategoriesRes } from '../models/categories-res';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = inject(API_URL);

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

  createProductReview(review: CreateReviewReq, token: string): Observable<CreateReviewRes> {
    return this.httpClient.post<CreateReviewRes>(`${this.apiURL}reviews`, review, {
      params: { token },
    });
  }

  getAllcatigories(): Observable<CategoriesRes> {
    return this.httpClient.get<CategoriesRes>(`${this.apiURL}categories`);
  }


}
