import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { Product } from '../models/products-res';
import { computed, inject } from '@angular/core';
import { ProductsService } from '../services/products-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

export interface ProductsState {
    isLoading: boolean;
    error: string | null;
    totalResults: number; 
}

const ProductsInitialState: ProductsState = {
    isLoading: false,
    error: null,
    totalResults: 0 
};

export const ProductsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Product>(),
    withState<ProductsState>(ProductsInitialState),
    withComputed((store) => ({
        totalProducts: computed(() => store.totalResults()),
        hasProducts: computed(() => store.entities().length > 0),
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
                                    const trueTotal = res.payload?.metadata.total || 0;

                                    patchState(store,
                                        setAllEntities(res.payload.data),
                                        {
                                            totalResults: trueTotal,
                                            isLoading: false
                                        }
                                    );
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