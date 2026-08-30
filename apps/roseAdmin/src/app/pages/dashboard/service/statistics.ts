import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { DASHBOARD } from '../../../shared/utilities/api-endpoints';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import { StatisticsResponse } from '../models/dashboard.models';


@Injectable({
  providedIn: 'root',
})
export class Statistics {
  private readonly _httpCaller = inject(APICallerService);

  getStatistics(
    revenuePeriod = 'monthly',
    lowStockThreshold = 20,
    topProductsLimit = 5,
    lowStockLimit = 20,
  ): Observable<StatisticsResponse> {
    const params = new HttpParams()
      .set('revenuePeriod', revenuePeriod)
      .set('lowStockThreshold', lowStockThreshold)
      .set('topProductsLimit', topProductsLimit)
      .set('lowStockLimit', lowStockLimit);

    return this._httpCaller.get<StatisticsResponse>(DASHBOARD.getStatistics, params).pipe(
      map((data) => data),
      catchError((error) => {
        console.error('Failed to load dashboard statistics', error);
        return throwError(() => error);
      }),
    );
  }
}
