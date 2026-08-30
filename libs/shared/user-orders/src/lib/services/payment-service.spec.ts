import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { PaymentsService } from './payment-service';
import { API_URL } from '@org/auth';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentsService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        {
          provide: HttpClient,
          useValue: {
            post: vi.fn(),
            get: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(PaymentsService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should create a checkout session', async () => {
    const response = {
      status: true,
      code: 201,
      payload: {
        checkoutUrl: 'https://checkout.stripe.com/pay/cs_test',
        sessionId: 'cs_test',
        expiresAt: new Date().toISOString(),
        reused: false,
      },
    };
    (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(response));

    const res = await firstValueFrom(
      service.createCheckoutSession({
        orderId: 'order-1',
        successUrl: 'http://localhost/home/checkout-result',
      }),
    );

    expect(res).toEqual(response);
    expect(httpClient.post).toHaveBeenCalledWith(
      'https://rose-app.elevate-bootcamp.cloud/api/payments/checkout-session',
      {
        orderId: 'order-1',
        successUrl: 'http://localhost/home/checkout-result',
      },
      undefined,
    );
  });

  it('should get checkout session status by session_id', async () => {
    const response = {
      status: true,
      code: 200,
      payload: {
        sessionId: 'cs_test',
        paymentStatus: 'paid',
        sessionStatus: 'complete',
        amountTotal: 100,
        currency: 'usd',
        order: { orderId: 'order-1', paymentStatus: 'SUCCEEDED' },
      },
    };
    (httpClient.get as ReturnType<typeof vi.fn>).mockReturnValue(of(response));

    const res = await firstValueFrom(service.getCheckoutSessionStatus('cs_test'));

    expect(res).toEqual(response);
    expect(httpClient.get).toHaveBeenCalledWith(
      'https://rose-app.elevate-bootcamp.cloud/api/payments/checkout-session',
      expect.objectContaining({
        params: expect.any(HttpParams),
      }),
    );

    const callArgs = (httpClient.get as ReturnType<typeof vi.fn>).mock.calls[0];
    const params = callArgs[1].params as HttpParams;
    expect(params.get('session_id')).toBe('cs_test');
  });
});
