import { HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from '../utilities/api-caller-service';
import { AddOrderReq, AddOrderRes, GetOrdersRes } from '../models/orders.model';
import { IS_ORDER_REQUEST } from '../interceptors/orders-http-context';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly _api = inject(ApiCallerService);
  private readonly apiUrl = 'orders';

  private getOrderContext(): HttpContext {
    return new HttpContext().set(IS_ORDER_REQUEST, true);
  }

  getAllOrders(page: number = 1, limit: number = 10): Observable<GetOrdersRes> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this._api.get<GetOrdersRes>(this.apiUrl, {
      params,
      context: this.getOrderContext(),
    });
  }

  createOrder(body: AddOrderReq): Observable<AddOrderRes> {
    return this._api.post<AddOrderRes>(this.apiUrl, body, {
      context: this.getOrderContext(),
    });
  }
}