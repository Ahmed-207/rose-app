import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { Product, CreateProductReq, UpdateProductReq } from '../models/product.model';
import { FilterParams } from '../models/filter.model';
import { AdminProductsState } from '../models/product-state.model';
import { ProductsService } from '../services/products.service';

const AdminProductsInitialState: AdminProductsState = {
    isLoading: false,
    error: null,
    totalResults: 0,
    filters: { page: 1, limit: 10 },
    selectedProduct: null,
    isSubmitting: false,
    submitError: null,
    hasLoaded: false,
};

export const AdminProductsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Product>(),
    withState<AdminProductsState>(AdminProductsInitialState),
    withComputed((store) => ({
        totalProducts: computed(() => store.totalResults()),
        activeFilters: computed(() => store.filters()),
    })),
    withMethods((store) => {
        const _service = inject(ProductsService);

        return {
            loadProducts: rxMethod<FilterParams>(
                pipe(
                    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
                    tap((filters) => patchState(store, { isLoading: true, error: null, filters })),
                    switchMap((filters) =>
                        _service.getAllProducts(filters).pipe(
                            tap({
                                next: (res) =>
                                    patchState(
                                        store,
                                        setAllEntities(res.data ?? []),
                                        {
                                            totalResults: res.metadata?.total ?? 0,
                                            isLoading: false,
                                            hasLoaded: true,
                                        },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load products',
                                        isLoading: false,
                                        hasLoaded: true,
                                    }),
                            }),
                            catchError(() => EMPTY),
                        ),
                    ),
                ),
            ),

            loadProductById: rxMethod<string>(
                pipe(
                    tap(() => patchState(store, { isLoading: true, error: null })),
                    switchMap((id) =>
                        _service.getProductById(id).pipe(
                            tap({
                                next: (res) =>
                                    patchState(store, {
                                        selectedProduct: res.product,
                                        isLoading: false,
                                    }),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message ?? 'Failed to load product',
                                        isLoading: false,
                                    }),
                            }),
                            catchError(() => EMPTY),
                        ),
                    ),
                ),
            ),

            addProduct(product: CreateProductReq) {
                patchState(store, { isSubmitting: true, submitError: null });
                return _service.createProduct(product).pipe(
                    tap({
                        next: (res) =>
                            patchState(store, addEntity(res.product), { isSubmitting: false }),
                        error: (e: { message?: string }) =>
                            patchState(store, {
                                submitError: e.message ?? 'Failed to create product',
                                isSubmitting: false,
                            }),
                    }),
                );
            },

            updateProduct(id: string, product: UpdateProductReq) {
                patchState(store, { isSubmitting: true, submitError: null });
                return _service.updateProduct(id, product).pipe(
                    tap({
                        next: (res) => {
                            patchState(
                                store,
                                updateEntity({ id: res.product.id, changes: res.product }),
                                { isSubmitting: false },
                            );
                            if (store.selectedProduct()?.id === res.product.id) {
                                patchState(store, { selectedProduct: res.product });
                            }
                        },
                        error: (e: { message?: string }) =>
                            patchState(store, {
                                submitError: e.message ?? 'Failed to update product',
                                isSubmitting: false,
                            }),
                    }),
                );
            },

            deleteProduct(id: string) {
                patchState(store, { isSubmitting: true, submitError: null });
                return _service.deleteProduct(id).pipe(
                    tap({
                        next: () => {
                            patchState(store, removeEntity(id), { isSubmitting: false });
                            if (store.selectedProduct()?.id === id) {
                                patchState(store, { selectedProduct: null });
                            }
                        },
                        error: (e: { message?: string }) =>
                            patchState(store, {
                                submitError: e.message ?? 'Failed to delete product',
                                isSubmitting: false,
                            }),
                    }),
                );
            },
        };
    }),
);