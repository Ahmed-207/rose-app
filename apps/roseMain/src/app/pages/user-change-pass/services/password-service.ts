import { Observable } from 'rxjs';
import { ChangePassReq, ChangePassRes } from '../models/password';
import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiCallerService } from '../utilities/api-caller-service';
import { SHOW_LOADING_SPINNER } from '../interceptors/password-http-context';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private readonly _api = inject(ApiCallerService);
  private readonly apiUrl = 'users/change-password';

  private getPassContext(): HttpContext {
    return new HttpContext().set(SHOW_LOADING_SPINNER, true);
  }

  changePass(body: ChangePassReq): Observable<ChangePassRes> {
    return this._api.post<ChangePassRes>(this.apiUrl, body, {
      context: this.getPassContext(),
    });
  }
}