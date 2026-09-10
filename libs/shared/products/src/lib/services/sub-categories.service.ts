import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CategoriesService } from './categories.service';
import { SubCategory } from '../models/category.model';

@Injectable({
    providedIn: 'root',
})
export class SubCategoriesService {
    private readonly _categoriesService = inject(CategoriesService);

    getSubCategories(categoryId?: string): Observable<SubCategory[]> {
        return this._categoriesService.getCategories({ page: 1, limit: 1000 }).pipe(
            map(response => {
                const categories = response.data ?? [];

                if (categoryId) {
                    const category = categories.find(c => c.id === categoryId);
                    return category?.subCategories ?? [];
                }

                return categories.flatMap(c => c.subCategories ?? []);
            }),
            catchError(err => {
                console.error('Failed to load sub-categories', err);
                return throwError(() => err);
            }),
        );
    }
}
