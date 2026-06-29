import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { Product } from '../models/products-res';
import { ProductsState } from '../models/products-state';
import { computed, inject } from '@angular/core';
import { ProductsService } from '../services/products-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

const ProductsInitialState: ProductsState = {
    isLoading: false,
    error: null
};

export const ProductsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Product>(),
    withState<ProductsState>(ProductsInitialState),
    withComputed(({ entities }) => ({
        totalProducts: computed(() => entities().length),
        hasProducts: computed(() => entities().length > 0),
    })),
    withMethods((store) => {
        const _pService = inject(ProductsService);

        return {
            loadProducts: rxMethod<{ pageNumber: number; limit: number }>(
                pipe(
                    tap(() => patchState(store, { isLoading: true })),
                    switchMap(({ pageNumber, limit }) =>
                        _pService.getAllProducts(pageNumber, limit).pipe(
                            tap({
                                next: (res) => {
                                    patchState(store, setAllEntities(res.payload.data), { isLoading: false });
                                    console.log(res.payload.data)
                                },
                                error: (e) => patchState(store, { error: e.message, isLoading: false })
                            })
                        )
                    )
                )
            )
        };
    })
);