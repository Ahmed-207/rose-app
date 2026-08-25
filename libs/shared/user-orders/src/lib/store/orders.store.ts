import { computed, inject, PLATFORM_ID } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { addEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { AddOrderReq, Order } from '../models/orders.model';
import { OrderState } from '../models/order-state';
import { OrdersService } from '../services/orders-service';
import { Router } from '@angular/router';
import { PaymentsService } from '../services/payment-service';
import { CheckoutSessionStatus } from '../models/payment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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
    const toastr = inject(ToastrService);
    const router = inject(Router);
    const translate = inject(TranslateService);
    const platformId = inject(PLATFORM_ID);
    const document = inject(DOCUMENT);

    const redirectToStripe = (checkoutUrl: string): void => {
      if (isPlatformBrowser(platformId)) {
        const win = document.defaultView;
        if (win) {
          win.location.href = checkoutUrl;
        }
      }
    };

    const navigateToCheckoutResult = (
      status: 'success' | 'fail',
      msg: string,
      orderId?: string,
    ): void => {
      const queryParams: Record<string, string> = { status, msg };
      if (orderId) {
        queryParams['orderId'] = orderId;
      }
      router.navigate(['/home/checkout-result'], { queryParams });
    };

    const verifyCheckoutSession = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            isPaymentLoading: true,
            paymentError: null,
            paymentStatus: 'idle',
          }),
        ),
        switchMap((sessionId) =>
          paymentsSvc.getCheckoutSessionStatus(sessionId).pipe(
            tap({
              next: (res) => {
                const status: CheckoutSessionStatus = res.payload;
                const order = status.order;
                const isPaid =
                  status.paymentStatus === 'paid' ||
                  (order?.paymentStatus === 'SUCCEEDED');

                if (isPaid && order) {
                  patchState(store, {
                    isPaymentLoading: false,
                    paymentStatus: 'succeeded',
                  });

                  // Refresh the order list so the newly paid order is up-to-date in the store.
                  loadOrders();

                  navigateToCheckoutResult(
                    'success',
                    translate.instant('Payment successful') || 'Payment successful',
                    order.orderId,
                  );
                } else {
                  patchState(store, {
                    isPaymentLoading: false,
                    paymentStatus: 'failed',
                    paymentError: 'Payment was not completed',
                  });

                  navigateToCheckoutResult(
                    'fail',
                    translate.instant('Payment was not completed') ||
                      'Payment was not completed',
                  );
                }
              },
              error: (e: { message?: string }) => {
                patchState(store, {
                  isPaymentLoading: false,
                  paymentStatus: 'failed',
                  paymentError: e.message || 'Payment verification failed',
                });

                navigateToCheckoutResult(
                  'fail',
                  e.message ||
                    translate.instant('Payment verification failed') ||
                    'Payment verification failed',
                );
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

                if (req.paymentMethod === 'CASH_ON_DELIVERY') {
                  navigateToCheckoutResult(
                    'success',
                    translate.instant('The request was created successfully.') ||
                      'The request was created successfully.',
                    res.payload.order.id,
                  );
                } else {
                  const checkoutUrl = res.payload.checkout?.checkoutUrl;

                  if (checkoutUrl) {
                    redirectToStripe(checkoutUrl);
                  } else {
                    patchState(store, {
                      error:
                        translate.instant(
                          'Checkout session could not be created. Please try again.',
                        ) ||
                        'Checkout session could not be created. Please try again.',
                    });

                    toastr.error(
                      translate.instant(
                        'Checkout session could not be created. Please try again.',
                      ) ||
                        'Checkout session could not be created. Please try again.',
                    );
                  }
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
      verifyCheckoutSession,
    };
  }),
);

// =============================================================================
// Legacy Payment Intent flow — kept for reference only.
// Replaced by the checkout-session workflow above.
// =============================================================================

// const payOrder = rxMethod<{ orderId: string; paymentMethodId?: string }>(
//   pipe(
//     tap(() =>
//       patchState(store, {
//         isPaymentLoading: true,
//         paymentError: null,
//         paymentStatus: 'idle',
//       }),
//     ),
//     switchMap(({ orderId, paymentMethodId }) =>
//       paymentsSvc.createIntent({ orderId }).pipe(
//         switchMap((intentRes) => {
//           const paymentIntentId = intentRes.payload.paymentIntentId;
//           patchState(store, { paymentIntentId });
//           return paymentsSvc.confirmPayment({
//             paymentIntentId,
//             paymentMethodId: paymentMethodId ?? 'pm_card_visa',
//           });
//         }),
//         tap({
//           next: (res) => {
//             const isSucceeded =
//               res.payload.paymentIntent.status === 'succeeded' ||
//               res.payload.order.paymentStatus === 'SUCCEEDED';
//             if (isSucceeded) {
//               patchState(store, {
//                 isPaymentLoading: false,
//                 paymentStatus: 'succeeded',
//               });
//               router.navigate(['/home/checkout-result'], {
//                 queryParams: { status: 'success', msg: 'Payment successful', orderId },
//               });
//             } else {
//               patchState(store, {
//                 isPaymentLoading: false,
//                 paymentStatus: 'failed',
//                 paymentError: 'فشلت عملية الدفع',
//               });
//               router.navigate(['/home/checkout-result'], {
//                 queryParams: { status: 'fail', msg: 'Payment failed' },
//               });
//             }
//           },
//           error: (e: { message?: string }) => {
//             patchState(store, {
//               isPaymentLoading: false,
//               paymentStatus: 'failed',
//               paymentError: e.message || 'فشلت عملية الدفع',
//             });
//             router.navigate(['/home/checkout-result'], {
//               queryParams: { status: 'fail' },
//             });
//           },
//         }),
//         catchError(() => EMPTY),
//       ),
//     ),
//   ),
// );
