import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Category } from '../models/category.model';
import { LookupState } from '../models/product-state.model';
import { CategoriesService } from '../services/categories.service';

const initialState: LookupState = {
    isLoading: false,
    error: null,
    loaded: false,
};

export const CategoriesStore = signalStore(
    { providedIn: 'root' },
    withEntities<Category>(),
    withState<LookupState>(initialState),
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