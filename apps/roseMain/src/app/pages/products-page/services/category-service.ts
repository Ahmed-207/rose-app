import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CategoryResponseDto } from '../model/categoryDto';
import { CATEGORY } from '../../../shared/Helpers/api-endpoints';
import { APICallerService } from '../../../shared/services/api-caller-service';
import { FilterParams } from '../model/FilterDto';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
   private readonly _httpCaller = inject(APICallerService);

  getCategories(filter:FilterParams): Observable<CategoryResponseDto>{
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
    return this._httpCaller.get<CategoryResponseDto>(CATEGORY.getCategories, params).pipe(
      map(data => {
        const responseData = data ?? ({} as CategoryResponseDto);

        return responseData;
      }),
      catchError(err => {
        console.error('Failed to load categories', err);
        return throwError(() => err);
      }),
    );
  }
}
