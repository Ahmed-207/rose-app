import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrderStore } from './orders.store';
import { OrdersService } from '../services/orders-service';
import { PaymentsService } from '../services/payment-service';
import { AddOrderReq, AddOrderRes, GetOrdersRes, Order } from '../models/orders.model';
import { GetCheckoutSessionStatusRes } from '../models/payment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

const mockOrder: Order = {
  id: 'order-1',
  userId: 'user-1',
  addressId: 'address-1',
  couponId: null,
  status: 'PENDING',
  paymentMethod: 'CREDIT_CARD',
  paymentStatus: 'PROCESSING',
  stripePaymentIntentId: null,
  subtotal: '100',
  discount: '0',
  shipping: '0',
  total: '100',
  trackingNumber: null,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  orderItems: [],
};

class MockOrdersService {
  createOrder = vi.fn();
  getAllOrders = vi.fn();
}

class MockPaymentsService {
  createCheckoutSession = vi.fn();
  getCheckoutSessionStatus = vi.fn();
}

class MockToastrService {
  error = vi.fn();
}

class MockTranslateService {
  instant = vi.fn((key: string) => key);
}

describe('OrderStore', () => {
  let store: InstanceType<typeof OrderStore>;
  let ordersService: MockOrdersService;
  let paymentsService: MockPaymentsService;
  let router: Router;

  const createMockDocument = () => {
    const location = { href: '' };
    return {
      defaultView: { location },
    } as Document;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: OrdersService, useClass: MockOrdersService },
        { provide: PaymentsService, useClass: MockPaymentsService },
        { provide: ToastrService, useClass: MockToastrService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: DOCUMENT, useValue: createMockDocument() },
        OrderStore,
      ],
    });

    store = TestBed.inject(OrderStore);
    ordersService = TestBed.inject(OrdersService) as unknown as MockOrdersService;
    paymentsService = TestBed.inject(PaymentsService) as unknown as MockPaymentsService;
    router = TestBed.inject(Router);
  });

  describe('createOrder', () => {
    it('should navigate to checkout-result for CASH_ON_DELIVERY orders', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const res: AddOrderRes = {
        status: true,
        code: 201,
        payload: { order: { ...mockOrder, paymentMethod: 'CASH_ON_DELIVERY' } },
      };
      ordersService.createOrder.mockReturnValue(of(res));

      const req: AddOrderReq = {
        addressId: 'address-1',
        paymentMethod: 'CASH_ON_DELIVERY',
      };
      store.createOrder(req);

      await vi.waitFor(() => {
        expect(ordersService.createOrder).toHaveBeenCalledWith(req);
        expect(navigateSpy).toHaveBeenCalledWith(['/home/checkout-result'], {
          queryParams: {
            status: 'success',
            msg: 'The request was created successfully.',
            orderId: 'order-1',
          },
        });
      });
    });

    it('should redirect to Stripe checkout URL for CREDIT_CARD orders', async () => {
      const doc = TestBed.inject(DOCUMENT) as unknown as { defaultView: { location: { href: string } } };

      const res: AddOrderRes = {
        status: true,
        code: 201,
        payload: {
          order: mockOrder,
          checkout: {
            checkoutUrl: 'https://checkout.stripe.com/pay/cs_test',
            sessionId: 'cs_test',
            expiresAt: new Date().toISOString(),
            reused: false,
          },
        },
      };
      ordersService.createOrder.mockReturnValue(of(res));

      const req: AddOrderReq = {
        addressId: 'address-1',
        paymentMethod: 'CREDIT_CARD',
        successUrl: 'http://localhost/home/checkout-result',
      };
      store.createOrder(req);

      await vi.waitFor(() => {
        expect(ordersService.createOrder).toHaveBeenCalledWith(req);
        expect(doc.defaultView.location.href).toBe('https://checkout.stripe.com/pay/cs_test');
      });
    });

    it('should show error and stay on page when checkout URL is missing for CREDIT_CARD', async () => {
      const toastr = TestBed.inject(ToastrService) as unknown as MockToastrService;
      const res: AddOrderRes = {
        status: true,
        code: 201,
        payload: { order: mockOrder, checkout: null },
      };
      ordersService.createOrder.mockReturnValue(of(res));

      const req: AddOrderReq = {
        addressId: 'address-1',
        paymentMethod: 'CREDIT_CARD',
      };
      store.createOrder(req);

      await vi.waitFor(() => {
        expect(store.error()).toBe(
          'Checkout session could not be created. Please try again.',
        );
        expect(toastr.error).toHaveBeenCalledWith(
          'Checkout session could not be created. Please try again.',
        );
      });
    });

    it('should set error state when order creation fails', async () => {
      ordersService.createOrder.mockReturnValue(
        throwError(() => ({ message: 'Order failed' })),
      );

      const req: AddOrderReq = {
        addressId: 'address-1',
        paymentMethod: 'CASH_ON_DELIVERY',
      };
      store.createOrder(req);

      await vi.waitFor(() => {
        expect(store.error()).toBe('Order failed');
      });
    });
  });

  describe('verifyCheckoutSession', () => {
    it('should refresh orders and navigate to success when payment is paid', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const statusRes: GetCheckoutSessionStatusRes = {
        payload: {
          sessionId: 'cs_test',
          paymentStatus: 'paid',
          sessionStatus: 'complete',
          amountTotal: 100,
          currency: 'usd',
          order: { orderId: 'order-1', paymentStatus: 'SUCCEEDED' },
        },
      };
      paymentsService.getCheckoutSessionStatus.mockReturnValue(of(statusRes));

      const ordersRes: GetOrdersRes = {
        status: true,
        code: 200,
        payload: {
          data: [mockOrder],
          metadata: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };
      ordersService.getAllOrders.mockReturnValue(of(ordersRes));

      store.verifyCheckoutSession('cs_test');

      await vi.waitFor(() => {
        expect(paymentsService.getCheckoutSessionStatus).toHaveBeenCalledWith('cs_test');
        expect(ordersService.getAllOrders).toHaveBeenCalledWith(1, 10);
        expect(navigateSpy).toHaveBeenCalledWith(['/home/checkout-result'], {
          queryParams: {
            status: 'success',
            msg: 'Payment successful',
            orderId: 'order-1',
          },
        });
      });
    });

    it('should navigate to fail page when payment is unpaid', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const statusRes: GetCheckoutSessionStatusRes = {
        payload: {
          sessionId: 'cs_test',
          paymentStatus: 'unpaid',
          sessionStatus: 'complete',
          amountTotal: null,
          currency: null,
          order: { orderId: 'order-1', paymentStatus: 'PENDING' },
        },
      };
      paymentsService.getCheckoutSessionStatus.mockReturnValue(of(statusRes));

      store.verifyCheckoutSession('cs_test');

      await vi.waitFor(() => {
        expect(navigateSpy).toHaveBeenCalledWith(['/home/checkout-result'], {
          queryParams: {
            status: 'fail',
            msg: 'Payment was not completed',
          },
        });
      });
    });

    it('should navigate to fail page when verification fails', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      paymentsService.getCheckoutSessionStatus.mockReturnValue(
        throwError(() => ({ message: 'Session not found' })),
      );

      store.verifyCheckoutSession('cs_test');

      await vi.waitFor(() => {
        expect(store.paymentError()).toBe('Session not found');
        expect(navigateSpy).toHaveBeenCalledWith(['/home/checkout-result'], {
          queryParams: {
            status: 'fail',
            msg: 'Session not found',
          },
        });
      });
    });
  });
});
