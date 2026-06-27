import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsRes } from '../models/products-res';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  private readonly httpClient = inject(HttpClient);

  getAllProducts(pageNum: number, pageLimit: number): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`https://rose-app.elevate-bootcamp.cloud/api/products?page=${pageNum}&limit=${pageLimit}`);
  }

  getProductById(id: string): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`https://rose-app.elevate-bootcamp.cloud/api/products/${id}`);
  }



}
