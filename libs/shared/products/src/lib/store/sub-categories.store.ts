import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { SubCategory } from '../models/category.model';
import { LookupListState } from '../models/product-state.model';
import { SubCategoriesService } from '../services/sub-categories.service';

const initialState: LookupListState = {
    isLoading: false,
    error: null,
    loaded: false,
    filters: { page: 1, limit: 10 },
    totalResults: 0,
};

export const SubCategoriesStore = signalStore(
    { providedIn: 'root' },
    withEntities<SubCategory>(),
    withState<LookupListState>(initialState),
    withComputed((store) => ({
        totalSubCategories: computed(() => store.totalResults()),
        hasSubCategories: computed(() => store.entities().length > 0),
        activeFilters: computed(() => store.filters()),
    })),
    withMethods((store) => {
        const _subCategories = inject(SubCategoriesService);

        return {
            loadSubCategories: rxMethod<string | undefined>(
                pipe(
                    tap(() => patchState(store, { isLoading: true, error: null })),
                    switchMap((categoryId) =>
                        _subCategories.getSubCategories(categoryId).pipe(
                            tap({
                                next: (data) =>
                                    patchState(
                                        store,
                                        setAllEntities(data ?? []),
                                        {
                                            isLoading: false,
                                            loaded: true,
                                            totalResults: data?.length ?? 0,
                                        },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load sub-categories',
                                        isLoading: false,
                                        loaded: true,
                                    }),
                            }),
                            catchError(() => EMPTY),
                        ),
                    ),
                ),
            ),

            reset() {
                patchState(store, setAllEntities([]), { loaded: false, error: null, totalResults: 0 });
            },
        };
    }),
);
