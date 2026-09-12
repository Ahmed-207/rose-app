
import { map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import {
  Occasion,
  OccasionDeleteResponse,
  OccasionListResponse,
  OccasionPayload,
  OccasionUpdateResponse,
  UploadImageRes,
} from '../models/occasion.models';

import { OCCASION, UPLOAD } from '@org/products'; 

@Injectable({ providedIn: 'root' })
export class OccasionsService {
  private readonly _httpCaller = inject(APICallerService);

  getOccasionList(page = 1, limit = 20, search = ''): Observable<OccasionListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this._httpCaller.get<OccasionListResponse>(OCCASION.getOccasions, params);
  }

  getById(id: string): Observable<Occasion> {
    return this._httpCaller
      .get<Occasion | OccasionUpdateResponse>(OCCASION.getOccasions + `/${id}`)
      .pipe(map((response) => ('occasion' in response ? response.occasion : (response as Occasion))));
  }

  create(payload: OccasionPayload): Observable<Occasion> {
    return this._httpCaller.post<Occasion>(OCCASION.getOccasions, payload);
  }

  update(id: string, payload: OccasionPayload): Observable<Occasion> {
    return this._httpCaller
      .patch<OccasionUpdateResponse>(OCCASION.getOccasions + `/${id}`, payload)
      .pipe(map((response) => response.occasion));
  }

  delete(id: string): Observable<OccasionDeleteResponse> {
    return this._httpCaller.delete<OccasionDeleteResponse>(OCCASION.getOccasions + `/${id}`);
  }

uploadImage(file: File): Observable<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  return this._httpCaller.post<any>(UPLOAD.uploadImage, formData).pipe(
    map((res) => {
      let imageUrl = res?.payload?.url || res?.url || res?.data?.url || res?.payload || '';
      
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        const baseUrl = 'https://rose.app.elevate.bootcamp.cloud'; 
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      return { url: imageUrl };
    })
  );
}
}