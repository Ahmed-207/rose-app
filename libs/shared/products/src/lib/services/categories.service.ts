import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APICallerService } from '../utilities/api-caller-service';
import { CATEGORY } from '../utilities/api-endpoints';
import { CategoryResponseDto } from '../models/category.model';

const EMPTY_CATEGORIES_RES: CategoryResponseDto = {
    data: [],
    metadata: { page: 1, limit: 0, total: 0, totalPages: 0 },
};

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    private readonly _httpCaller = inject(APICallerService);

    getCategories(): Observable<CategoryResponseDto> {
        return this._httpCaller.get<CategoryResponseDto>(CATEGORY.getCategories).pipe(
            map(data => data ?? EMPTY_CATEGORIES_RES),
            catchError(err => {
                console.error('Failed to load categories', err);
                return throwError(() => err);
            }),
        );
    }
}