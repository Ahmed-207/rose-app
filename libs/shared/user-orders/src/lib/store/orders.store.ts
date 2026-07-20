import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { addEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { AddOrderReq, Order } from '../models/orders.model';
import { OrderState } from '../models/order-state';
import { OrdersService } from '../services/orders-service';

const orderInitialState: OrderState = {
    isLoading: false,
    error: null,
    totalResults: 0,
};

export const OrderStore = signalStore(
    { providedIn: 'root' },
    withEntities<Order>(),
    withState<OrderState>(orderInitialState),
    withComputed((store) => ({
        totalOrders: computed(() => store.totalResults()),
        hasOrders: computed(() => store.entities().length > 0),
        ordersByNewest: computed(() =>
            [...store.entities()].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            ),
        ),
    })),
    withMethods((store) => {
        const svc = inject(OrdersService);

        return {

            loadOrders: rxMethod<{ page?: number; limit?: number } | void>(
                pipe(
                    tap(() => patchState(store, { isLoading: true, error: null })),
                    switchMap((params) =>
                        svc.getAllOrders(params?.page ?? 1, params?.limit ?? 10).pipe(
                            tap({
                                next: (res) =>
                                    patchState(
                                        store,
                                        setAllEntities(res.payload.data ?? []),
                                        {
                                            isLoading: false,
                                            totalResults: res.payload.metadata?.total ?? 0,
                                        },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message || 'Failed to load orders',
                                        isLoading: false,
                                    }),
                            }),
                        ),
                    ),
                ),
            ),

            createOrder: rxMethod<AddOrderReq>(
                pipe(
                    tap(() => patchState(store, { isLoading: true, error: null })),
                    switchMap((req) =>
                        svc.createOrder(req).pipe(
                            tap({
                                next: (res) =>
                                    patchState(
                                        store,
                                        addEntity(res.payload.order),
                                        {
                                            isLoading: false,
                                            totalResults: store.totalResults() + 1,
                                        },
                                    ),
                                error: (e: { message?: string }) =>
                                    patchState(store, {
                                        error: e.message || 'Failed to create order',
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