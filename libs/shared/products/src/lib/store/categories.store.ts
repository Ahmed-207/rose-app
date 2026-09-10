import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { Category } from '../models/category.model';
import { LookupListState } from '../models/product-state.model';
import { FilterParams } from '../models/filter.model';
import { CategoriesService } from '../services/categories.service';

const initialState: LookupListState = {
    isLoading: false,
    error: null,
    loaded: false,
    filters: { page: 1, limit: 10 },
    totalResults: 0,
};

export const CategoriesStore = signalStore(
    { providedIn: 'root' },
    withEntities<Category>(),
    withState<LookupListState>(initialState),
    withComputed((store) => ({
        totalCategories: computed(() => store.totalResults()),
        hasCategories: computed(() => store.entities().length > 0),
        activeFilters: computed(() => store.filters()),
    })),
    withMethods((store) => {
        const _categories = inject(CategoriesService);

        return {
            loadOnce: rxMethod<void>(
                pipe(
                    tap(() => {
                        if (store.loaded() || store.isLoading()) return;
                        patchState(store, { isLoading: true, error: null });
                    }),
                    switchMap(() => {
                        if (store.loaded()) return [];

                        return _categories.getCategories().pipe(
                            tap({
                                next: (res) =>
                                    patchState(
                                        store,
                                        setAllEntities(res.data ?? []),
                                        { isLoading: false, loaded: true },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load categories',
                                        isLoading: false,
                                    }),
                            }),
                        );
                    }),
                ),
            ),

            loadCategories: rxMethod<FilterParams>(
                pipe(
                    tap((filters) => patchState(store, { isLoading: true, error: null, filters })),
                    switchMap((filters) =>
                        _categories.getCategories(filters).pipe(
                            tap({
                                next: (res) => {
                                    const trueTotal = res.metadata?.total || 0;

                                    patchState(
                                        store,
                                        setAllEntities(res.data ?? []),
                                        {
                                            totalResults: trueTotal,
                                            isLoading: false,
                                            loaded: true,
                                        },
                                    );
                                },
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load categories',
                                        isLoading: false,
                                        loaded: true,
                                    }),
                            }),
                            catchError(() => EMPTY),
                        ),
                    ),
                ),
            ),

            applyFilters(this: { loadCategories: (f: FilterParams) => void }, filters: FilterParams) {
                this.loadCategories({
                    page: 1,
                    limit: store.filters().limit,
                    ...filters,
                });
            },

            resetFilters(this: { loadCategories: (f: FilterParams) => void }) {
                this.loadCategories({ page: 1, limit: store.filters().limit ?? 10 });
            },

            refresh: rxMethod<void>(
                pipe(
                    tap(() => patchState(store, { isLoading: true, error: null, loaded: false })),
                    switchMap(() =>
                        _categories.getCategories().pipe(
                            tap({
                                next: (res) =>
                                    patchState(
                                        store,
                                        setAllEntities(res.data ?? []),
                                        { isLoading: false, loaded: true },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load categories',
                                        isLoading: false,
                                    }),
                            }),
                        ),
                    ),
                ),
            ),
        };
    }),
);
