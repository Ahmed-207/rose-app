import { environment } from "@env";
import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetAddressesRes } from '../models/get-addresses';
import { IS_ADDRESS_REQUEST } from '../interceptors/address-http-context';
import { EditAddressReq, EditAddressRes } from "../models/edit-address";
import { DeleteAddressRes } from "../models/delete-address";

@Injectable({
  providedIn: 'root',
})
export class AddressService {

  private readonly _http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}addresses`;

  private getAddressContext(): HttpContext {
    return new HttpContext().set(IS_ADDRESS_REQUEST, true);
  }

  getAddresses(): Observable<GetAddressesRes> {
    return this._http.get<GetAddressesRes>(this.apiUrl, {
      context: this.getAddressContext()
    });
  }

  addAddress(newAddress: EditAddressReq): Observable<EditAddressRes> {
    return this._http.post<EditAddressRes>(this.apiUrl, newAddress, {
      context: this.getAddressContext()
    })
  }

  updateAddress(updatedAddress: Partial<EditAddressReq>, addressId: string): Observable<EditAddressRes> {
    return this._http.patch<EditAddressRes>(this.apiUrl + `/${addressId}`, updatedAddress, {
      context: this.getAddressContext()
    })
  }

  deleteAddress(addressId: string): Observable<DeleteAddressRes> {
    return this._http.delete<DeleteAddressRes>(this.apiUrl + `/${addressId}`, {
      context: this.getAddressContext()
    })
  }

}
