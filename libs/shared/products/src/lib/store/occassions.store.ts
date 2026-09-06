import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { Occasion } from '../models/occassion.model';
import { LookupListState } from '../models/product-state.model';
import { FilterParams } from '../models/filter.model';
import { OccasionsService } from '../services/occassions.service';

const initialState: LookupListState = {
    isLoading: false,
    error: null,
    loaded: false,
    filters: { page: 1, limit: 10 },
    totalResults: 0,
};

export const OccasionsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Occasion>(),
    withState<LookupListState>(initialState),
    withComputed((store) => ({
        totalOccasions: computed(() => store.totalResults()),
        hasOccasions: computed(() => store.entities().length > 0),
        activeFilters: computed(() => store.filters()),
    })),
    withMethods((store) => {
        const _occasions = inject(OccasionsService);

        return {
            loadOnce: rxMethod<void>(
                pipe(
                    tap(() => {
                        if (store.loaded() || store.isLoading()) return;
                        patchState(store, { isLoading: true, error: null });
                    }),
                    switchMap(() => {
                        if (store.loaded()) return [];

                        return _occasions.getOccasions().pipe(
                            tap({
                                next: (res) =>
                                    patchState(
                                        store,
                                        setAllEntities(res.data ?? []),
                                        { isLoading: false, loaded: true },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load occasions',
                                        isLoading: false,
                                    }),
                            }),
                        );
                    }),
                ),
            ),

            loadOccasions: rxMethod<FilterParams>(
                pipe(
                    tap((filters) => patchState(store, { isLoading: true, error: null, filters })),
                    switchMap((filters) =>
                        _occasions.getOccasions(filters).pipe(
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
                                        error: e.message ?? 'Failed to load occasions',
                                        isLoading: false,
                                        loaded: true,
                                    }),
                            }),
                            catchError(() => EMPTY),
                        ),
                    ),
                ),
            ),

            applyFilters(this: { loadOccasions: (f: FilterParams) => void }, filters: FilterParams) {
                this.loadOccasions({
                    page: 1,
                    limit: store.filters().limit,
                    ...filters,
                });
            },

            resetFilters(this: { loadOccasions: (f: FilterParams) => void }) {
                this.loadOccasions({ page: 1, limit: store.filters().limit ?? 10 });
            },
        };
    }),
);
