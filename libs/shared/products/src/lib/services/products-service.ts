import { environment } from './../../../../../../apps/roseAppShell/src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, ProductsRes } from '../models/products-res';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  getBestProducts(arg0: number) {
    throw new Error('Method not implemented.');
  }
 

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = signal<string>(environment.apiUrl)

  getAllProducts(pageNum: number, pageLimit: number): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`${this.apiURL()}products?page=${pageNum}&limit=${pageLimit}`);
  }

  getProductById(id: string): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`${this.apiURL()}products/${id}`);
  }

  getAllcatigories(): Observable<Category> {
    return this.httpClient.get<Category>(`${this.apiURL()}categories`);
  }


}
