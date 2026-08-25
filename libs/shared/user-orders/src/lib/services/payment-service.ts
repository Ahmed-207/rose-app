import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from '../utilities/api-caller-service';
import {
  CreateCheckoutSessionReq,
  CreateCheckoutSessionRes,
  GetCheckoutSessionStatusRes,
} from '../models/payment';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly _api = inject(ApiCallerService);
  private readonly apiUrl = 'payments';

  createCheckoutSession(
    body: CreateCheckoutSessionReq,
  ): Observable<CreateCheckoutSessionRes> {
    return this._api.post<CreateCheckoutSessionRes>(
      this.apiUrl + '/checkout-session',
      body,
    );
  }

  getCheckoutSessionStatus(
    sessionId: string,
  ): Observable<GetCheckoutSessionStatusRes> {
    return this._api.get<GetCheckoutSessionStatusRes>(
      this.apiUrl + '/checkout-session',
      {
        params: new HttpParams().set('session_id', sessionId),
      },
    );
  }
}

// =============================================================================
// Legacy Stripe Payment Intent flow — kept for reference only.
// Replaced by the checkout-session workflow in the methods above.
// =============================================================================

// import { ConfirmPaymentReq, ConfirmPaymentRes, CreateIntentReq, CreateIntentRes } from '../models/payment';

// createIntent(body: CreateIntentReq): Observable<CreateIntentRes> {
//   return this._api.post<CreateIntentRes>(this.apiUrl + '/create-intent', body);
// }

// confirmPayment(body: ConfirmPaymentReq): Observable<ConfirmPaymentRes> {
//   return this._api.post<ConfirmPaymentRes>(this.apiUrl + '/confirm', body);
// }
