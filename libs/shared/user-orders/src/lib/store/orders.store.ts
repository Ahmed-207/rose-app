import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { addEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { AddOrderReq, Order } from '../models/orders.model';
import { OrderState } from '../models/order-state';
import { OrdersService } from '../services/orders-service';
import { Router } from '@angular/router';
import { PaymentsService } from '../services/payment-service';
import { ConfirmPaymentRes, CreateIntentRes } from '../models/payment';
import { AppToastService } from '@org/shared-ui-components';
const orderInitialState: OrderState = {
    isLoading: false,
    error: null,
    totalResults: 0,
    isPaymentLoading: false,
    paymentError: null,
    paymentIntentId: null,
    paymentStatus: 'idle',
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
        const paymentsSvc = inject(PaymentsService);
        const toast = inject(AppToastService);
        const router = inject(Router);

        const payOrder = rxMethod<{ orderId: string; paymentMethodId?: string }>(
            pipe(
                tap(() =>
                    patchState(store, {
                        isPaymentLoading: true,
                        paymentError: null,
                        paymentStatus: 'idle',
                    }),
                ),
                switchMap(({ orderId, paymentMethodId }) =>
                    paymentsSvc.createIntent({ orderId }).pipe(
                        switchMap((intentRes: CreateIntentRes) => {
                            const paymentIntentId = intentRes.payload.paymentIntentId;

                            patchState(store, { paymentIntentId });

                            return paymentsSvc.confirmPayment({
                                paymentIntentId,
                                paymentMethodId: paymentMethodId ?? 'pm_card_visa',
                            });
                        }),
                        tap({
                            next: (res: ConfirmPaymentRes) => {
                                const isSucceeded =
                                    res.payload.paymentIntent.status === 'succeeded' ||
                                    res.payload.order.paymentStatus === 'SUCCEEDED';

                                if (isSucceeded) {
                                    patchState(store, {
                                        isPaymentLoading: false,
                                        paymentStatus: 'succeeded',
                                    });

                               toast.success('toast.PAYMENT_SUCCEEDED');
                               router.navigate(['/home/checkout-result'], {
  queryParams: { status: "success" , msg:"Payment successful",orderId: orderId}
});

                                } else {
                                    patchState(store, {
                                        isPaymentLoading: false,
                                        paymentStatus: 'failed',
                                        paymentError: 'فشلت عملية الدفع',
                                    });

                              toast.error('toast.PAYMENT_FAILED');
                                      router.navigate(['/home/checkout-result'], {
  queryParams: { status: "fail" , msg:"Payment failed"}
});

                                }
                            },
                            error: (e: { message?: string }) => {
                                patchState(store, {
                                    isPaymentLoading: false,
                                    paymentStatus: 'failed',
                                    paymentError: e.message || 'فشلت عملية الدفع',
                                });

                              toast.error(e.message ?? 'toast.PAYMENT_FAILED');
                              router.navigate(['/home/checkout-result'], {
  queryParams: { status: "fail"}
});
                            },
                        }),
                        catchError(() => EMPTY),
                    ),
                ),
            ),
        );

        const loadOrders = rxMethod<{ page?: number; limit?: number } | void>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                switchMap((params) =>
                    svc.getAllOrders(params?.page ?? 1, params?.limit ?? 10).pipe(
                        tap({
                            next: (res) =>
                                patchState(store, setAllEntities(res.payload.data ?? []), {
                                    isLoading: false,
                                    totalResults: res.payload.metadata?.total ?? 0,
                                }),
                            error: (e: { message?: string }) =>
                                patchState(store, {
                                    error: e.message || 'Failed to load orders',
                                    isLoading: false,
                                }),
                        }),
                        catchError(() => EMPTY),
                    ),
                ),
            ),
        );

        const createOrder = rxMethod<AddOrderReq>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                switchMap((req) =>
                    svc.createOrder(req).pipe(
                        tap({
                            next: (res) => {
                                patchState(store, addEntity(res.payload.order), {
                                    isLoading: false,
                                    totalResults: store.totalResults() + 1,
                                });
  if (req.paymentMethod === "CASH_ON_DELIVERY") {

                   toast.success('toast.ORDER_PLACED');
                   router.navigate(['/home/checkout-result'], {
  queryParams: { status: "success" , msg:"The request was created successfully.",orderId: res.payload.order.id}
});

                } else {
                  payOrder({ orderId: res.payload.order.id });
                }


                            },
                            error: (e: { message?: string }) =>
                                patchState(store, {
                                    error: e.message || 'Failed to create order',
                                    isLoading: false,
                                }),
                        }),
                        catchError(() => EMPTY),
                    ),
                ),
            ),
        );

        return {
            loadOrders,
            createOrder,
            payOrder,
        };
    }),
);
