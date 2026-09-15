import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import {
  Category,
  CategoryDeleteResponse,
  CategoryListResponse,
  CategoryPayload,
  CategoryUpdateResponse,
  UploadImageRes,
} from '../models/category.models';
import { CATEGORY, UPLOAD } from '@org/products';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly _httpCaller = inject(APICallerService);

  getCategoryList(page = 1, limit = 20, search = ''): Observable<CategoryListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this._httpCaller.get<CategoryListResponse>(CATEGORY.getCategories, params);
  }

  getById(id: string): Observable<Category> {
    return this._httpCaller.get<Category | CategoryUpdateResponse>(CATEGORY.getCategories + `/${id}`)
      .pipe(map((response) => ('category' in response ? response.category : response)));
  }

  create(payload: CategoryPayload): Observable<Category> {
    debugger
    return this._httpCaller.post<Category>(CATEGORY.getCategories, payload);
  }

  update(id: string, payload: CategoryPayload): Observable<Category> {
    return this._httpCaller
      .patch<CategoryUpdateResponse>(CATEGORY.getCategories + `/${id}`, payload)
      .pipe(map((response) => response.category));
  }

  delete(id: string): Observable<CategoryDeleteResponse> {
    return this._httpCaller.delete<CategoryDeleteResponse>(CATEGORY.getCategories + `/${id}`);
  }

   uploadImage(file: File): Observable<UploadImageRes> {
          const formData = new FormData();
          formData.append('image', file);

    return this._httpCaller.post<UploadImageRes>(UPLOAD.uploadImage, formData).pipe(
      catchError((error: unknown) => {
        console.error('Failed to upload image', error);

        if (
          error instanceof HttpErrorResponse &&
          (error.status === 413 || (error.status === 0 && error.url?.includes('/api/upload')))
        ) {
          return throwError(
            () =>
              new HttpErrorResponse({
                error: { message: 'Image is too large. Please choose a smaller image.' },
                status: 413,
                statusText: 'Payload Too Large',
                url: error.url ?? undefined,
              }),
          );
        }

        return throwError(() => error);
      }),
    );
      }

}
