import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import {
  Category,
  CategoryDeleteResponse,
  CategoryListResponse,
  CategoryPayload,
  CategoryUpdateResponse,
} from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = inject(APICallerService);

  getCategoryList(page = 1, limit = 20): Observable<CategoryListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.api.get<CategoryListResponse>('/api/categories', params);
  }

  getById(id: string): Observable<Category> {
    return this.api
      .get<Category | CategoryUpdateResponse>(`/api/categories/${id}`)
      .pipe(map((response) => ('category' in response ? response.category : response)));
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.api.post<Category>('/api/categories', payload);
  }

  update(id: string, payload: CategoryPayload): Observable<Category> {
    return this.api
      .patch<CategoryUpdateResponse>(`/api/categories/${id}`, payload)
      .pipe(map((response) => response.category));
  }

  delete(id: string): Observable<CategoryDeleteResponse> {
    return this.api.delete<CategoryDeleteResponse>(`/api/categories/${id}`);
  }
}
