import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { FilterParams } from '../models/filter.model';
import { ProductsState } from '../models/product-state.model';
import { ProductsService } from '../services/products.service';

const ProductsInitialState: ProductsState = {
    isLoading: false,
    error: null,
    totalResults: 0,
    filters: { page: 1, limit: 12 },
    bestProducts: [],
    isBestLoading: false,
    hasLoaded: false,
};

export const ProductsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Product>(),
    withState<ProductsState>(ProductsInitialState),
    withComputed((store) => ({
        totalProducts: computed(() => store.totalResults()),
        hasProducts: computed(() => store.entities().length > 0),
        activeFilters: computed(() => store.filters()),
        byPopularity: computed(() =>
            [...store.entities()].sort(
                (a, b) =>
                    (b._count?.cartItems ?? 0) - (a._count?.cartItems ?? 0) ||
                    b.rating - a.rating,
            ),
        ),
    })),
    withMethods((store) => {
        const _pService = inject(ProductsService);

        return {
            loadProducts: rxMethod<FilterParams>(
                pipe(
                    tap((filters) => patchState(store, { isLoading: true, error: null, filters })),
                    switchMap((filters) =>
                        _pService.getAllProducts(filters).pipe(
                            tap({
                                next: (res) => {
                                    const trueTotal = res.metadata?.total || 0;

                                    patchState(
                                        store,
                                        setAllEntities(res.data ?? []),
                                        {
                                            totalResults: trueTotal,
                                            isLoading: false,
                                            hasLoaded: true,
                                        },
                                    );
                                },
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load products',
                                        isLoading: false,
                                        hasLoaded: true,
                                    }),
                            }),
                        ),
                    ),
                ),
            ),

            loadBestProducts: rxMethod<FilterParams>(
                pipe(
                    tap(() => patchState(store, { isBestLoading: true })),
                    switchMap((params) =>
                        _pService.getAllProducts(params).pipe(
                            tap({
                                next: (res) => {
                                    patchState(store, {
                                        bestProducts: res.data ?? [],
                                        isBestLoading: false,
                                    });
                                },
                                error: () => patchState(store, { isBestLoading: false }),
                            }),
                        ),
                    ),
                ),
            ),

            applyCategoryFilter(this: { loadProducts: (f: FilterParams) => void }, categoryId: string | null) {
                const nextFilters: FilterParams = {
                    page: 1,
                    limit: store.filters().limit,
                    categoryId: categoryId ?? undefined,
                };
                this.loadProducts(nextFilters);
            },
            applyFilters(this: { loadProducts: (f: FilterParams) => void }, filters: FilterParams) {
                this.loadProducts({
                    page: 1,
                    limit: store.filters().limit,
                    ...filters,
                });
            },

            resetFilters(this: { loadProducts: (f: FilterParams) => void }) {
                this.loadProducts({ page: 1, limit: store.filters().limit ?? 12 });
            },
        };
    }),
);