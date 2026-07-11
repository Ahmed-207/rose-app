import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { FilterParams } from '../model/FilterDto';
import { APICallerService } from '../../../shared/services/api-caller-service';
import { HttpParams } from '@angular/common/http';
import { OCCASION } from '../../../shared/Helpers/api-endpoints';
import { OccasionResponseDto } from '../model/occationsDto';

@Injectable({
  providedIn: 'root',
})
export class OccasionsService {
  private readonly _httpCaller = inject(APICallerService);

  getOccasions(filter:FilterParams): Observable<OccasionResponseDto>{
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
    return this._httpCaller.get<OccasionResponseDto>(OCCASION.getOccasions, params).pipe(
      map(data => {
        const responseData = data ?? ({} as OccasionResponseDto);

        return responseData;
      }),
      catchError(err => {
        console.error('Failed to load occasions', err);
        return throwError(() => err);
      }),
    );
  }
}
