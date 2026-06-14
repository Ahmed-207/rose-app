import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';


export interface LoginReq {
  username: string;
  password: string;
}


export interface loginRes {
  status: boolean
  code: number
  payload: Payload
}

export interface Payload {
  user: User
  token: string
}

export interface User {
  id: string
  username: string
  email: string
  phone: any
  firstName: string
  lastName: string
  gender: string
  emailVerified: boolean
  phoneVerified: boolean
  role: string
}


@Injectable({
  providedIn: 'root',
})
export class UserData {

  isLoggedIn: WritableSignal<boolean> = signal(false);
  userData: WritableSignal<User> = signal({} as User);



  private readonly httpClient = inject(HttpClient);
  private readonly cookieService = inject(CookieService);

  checkLoggedIn(): void {
    const savedToken = this.cookieService.get('token');
    if (savedToken) {
      this.isLoggedIn.set(true);
      this.userData.set(JSON.parse(this.cookieService.get('userSavedData')));
    }
  }

  login(userReqData: LoginReq): Observable<loginRes> {
    return this.httpClient.post<loginRes>('https://rose-app.elevate-bootcamp.cloud/api/auth/login', userReqData)
  }

}
