import { environment } from './../../../../../../apps/roseAppShell/src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsRes } from '../models/products-res';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  private readonly httpClient = inject(HttpClient);
  private readonly apiURL = signal<string>(environment.apiUrl)

  getAllProducts(pageNum: number, pageLimit: number): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`${this.apiURL()}products?page=${pageNum}&limit=${pageLimit}`);
  }

  getProductById(id: string): Observable<ProductsRes> {
    return this.httpClient.get<ProductsRes>(`${this.apiURL()}products/${id}`);
  }



}
