
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from '../utilities/api-caller-service';

import { ConfirmPaymentReq, ConfirmPaymentRes, CreateIntentReq, CreateIntentRes } from '../models/payment';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly _api = inject(ApiCallerService);
  private readonly apiUrl = 'payments';



  createIntent(body: CreateIntentReq): Observable<CreateIntentRes> {
    return this._api.post<CreateIntentRes>(this.apiUrl +'/create-intent', body);
  }
  confirmPayment(body: ConfirmPaymentReq): Observable<ConfirmPaymentRes> {
    return this._api.post<ConfirmPaymentRes>(this.apiUrl +'/confirm', body);
  }
}
