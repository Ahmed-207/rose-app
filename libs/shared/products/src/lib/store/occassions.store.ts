import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Occasion } from '../models/occassion.model';
import { LookupState } from '../models/product-state.model';
import { OccasionsService } from '../services/occassions.service';

const initialState: LookupState = {
    isLoading: false,
    error: null,
    loaded: false,
};

export const OccasionsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Occasion>(),
    withState<LookupState>(initialState),
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
        };
    }),
);