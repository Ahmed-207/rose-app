import { inject, Injectable } from '@angular/core';
import { APICallerService } from '../../../shared/services/api-caller-service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { PRODUCT } from '../../../shared/Helpers/api-endpoints';
import { FilterParams } from '../model/FilterDto';
import { ProductResponseDto } from '../model/productDto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _httpCaller = inject(APICallerService);


  getProducts(filter: FilterParams): Observable<ProductResponseDto> {
    let params = new HttpParams();

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          (typeof value !== 'number' || !isNaN(value))
        ) {
          // HttpParams.set() returns a NEW instance - it does not mutate
          // `params` in place. Must reassign, or every param is silently lost.
          params = params.set(key, value.toString());
        }
      });
    }

    return this._httpCaller.get<ProductResponseDto>(PRODUCT.getProducts, params).pipe(
      map(data => {
        const responseData = data ?? ({} as ProductResponseDto);

        return responseData;
      }),
      catchError(err => {
        console.error('Failed to load products', err);
        return throwError(() => err);
      }),
    );
  }

}
