import { environment } from './../../../../../../apps/roseAppShell/src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProductsRes, SingleProductRes } from '../models/products-res';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = signal<string>(environment.apiUrl)

  getAllProducts(pageNum: number, pageLimit: number): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`${this.apiURL()}products?page=${pageNum}&limit=${pageLimit}`);
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
    return this.httpClient.get<SingleProductRes>(`${this.apiURL()}products/${id}`);
  }



}
