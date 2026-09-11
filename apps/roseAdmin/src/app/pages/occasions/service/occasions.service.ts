import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import {
  Occasion,
  OccasionDeleteResponse,
  OccasionListResponse,
  OccasionPayload,
  OccasionUpdateResponse,
} from '../models/occasion.models';

@Injectable({ providedIn: 'root' })
export class OccasionsService {
  private readonly api = inject(APICallerService);

  getOccasionList(page = 1, limit = 20): Observable<OccasionListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.api.get<OccasionListResponse>('/api/occasions', params);
  }

  getById(id: string): Observable<Occasion> {
    return this.api
      .get<{ payload: Occasion | { occasion: Occasion } }>(`/api/occasions/${id}`)
      .pipe(
        map((response) => 
          'occasion' in response.payload ? response.payload.occasion : response.payload
        )
      );
  }

  create(payload: OccasionPayload): Observable<Occasion> {
    return this.api
      .post<{ payload: Occasion }>('/api/occasions', payload)
      .pipe(map((res) => res.payload));
  }

  update(id: string, payload: OccasionPayload): Observable<Occasion> {
    return this.api
      .patch<OccasionUpdateResponse>(`/api/occasions/${id}`, payload)
      .pipe(map((response) => response.payload.occasion));
  }

  delete(id: string): Observable<OccasionDeleteResponse> {
    return this.api.delete<OccasionDeleteResponse>(`/api/occasions/${id}`);
  }
}