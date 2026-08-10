import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthErrorService } from './auth-error.service';
import { resolveAuthErrorMessage } from '../utils/resolve-auth-error-message';
import { API_URL } from '../config/api';
import { AuthApiEndpoint, AuthHttpMethod, UsersApiEndpoint } from '../config/enums';
import { Role } from '../config/role.enum';
import { ApiResponse } from '../models/api-response.model';
import { AuthenticatedSession } from '../models/authenticated-session.model';
import { ChangePasswordRequest } from '../models/change-password-request.model';
import { ConfirmEmailVerificationRequest } from '../models/confirm-email-verification-request.model';
import { ConfirmEmailVerificationResponseData } from '../models/confirm-email-verification-response.model';
import { ForgotPasswordRequest } from '../models/forgot-password-request.model';
import { ForgotPasswordResponseData } from '../models/forgot-password-response.model';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponseData } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { RegisterResponseData } from '../models/register-response.model';
import { ResetPasswordRequest } from '../models/reset-password-request.model';
import { ResetPasswordResponseData } from '../models/reset-password-response.model';
import { SendEmailVerificationRequest } from '../models/send-email-verification-request.model';
import { SendEmailVerificationResponseData } from '../models/send-email-verification-response.model';
import {
  ConfirmEmailChangeRequest,
  RequestEmailChangeRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../models/user-profile.model';
import { AuthCookieStorage } from '../storage/auth-cookie-storage';
import { adaptLoginResponse } from '../utils/adapters/login.adapter';
import { adaptRegisterResponse } from '../utils/adapters/register.adapter';
import { adaptUserProfileResponse } from '../utils/adapters/user-profile.adapter';
import { resolveRoleFromToken } from '../utils/jwt.util';

@Injectable({
  providedIn: 'root',
})
export class AuthActions {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL).replace(/\/+$/, '');
  private readonly authCookieStorage = inject(AuthCookieStorage);
  private readonly authErrorService = inject(AuthErrorService);

  sendEmailVerification(
    request: SendEmailVerificationRequest,
  ): Observable<ApiResponse<SendEmailVerificationResponseData>> {
    return this.authRequest<SendEmailVerificationResponseData>(
      AuthHttpMethod.Post,
      AuthApiEndpoint.SendEmailVerification,
      request,
    );
  }

  confirmEmailVerification(
    request: ConfirmEmailVerificationRequest,
  ): Observable<ApiResponse<ConfirmEmailVerificationResponseData>> {
    return this.authRequest<ConfirmEmailVerificationResponseData>(
      AuthHttpMethod.Post,
      AuthApiEndpoint.ConfirmEmailVerification,
      request,
    );
  }

  register(request: RegisterRequest): Observable<AuthenticatedSession> {
    return this.authRequest<RegisterResponseData>(
      AuthHttpMethod.Post,
      AuthApiEndpoint.Register,
      request,
    ).pipe(
      map((response) => {
        const session = adaptRegisterResponse(response);
        this.authCookieStorage.setSession(session);
        return session;
      }),
    );
  }

  login(request: LoginRequest): Observable<AuthenticatedSession> {
    const { rememberMe, ...credentials } = request;

    return this.authRequest<LoginResponseData>(
      AuthHttpMethod.Post,
      AuthApiEndpoint.Login,
      credentials,
    ).pipe(
      map((response) => {
        const session = adaptLoginResponse(response);
        this.authCookieStorage.setSession(session, { rememberMe });
        return session;
      }),
    );
  }

  forgotPassword(
    request: ForgotPasswordRequest,
  ): Observable<ApiResponse<ForgotPasswordResponseData>> {
    return this.authRequest<ForgotPasswordResponseData>(
      AuthHttpMethod.Post,
      AuthApiEndpoint.ForgotPassword,
      request,
    );
  }

  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<ApiResponse<ResetPasswordResponseData>> {
    return this.authRequest<ResetPasswordResponseData>(
      AuthHttpMethod.Post,
      AuthApiEndpoint.ResetPassword,
      request,
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.usersRequest<unknown>(
      AuthHttpMethod.Get,
      UsersApiEndpoint.Profile,
    ).pipe(
      map((response) => adaptUserProfileResponse(response)),
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) {
          this.authErrorService.report(resolveAuthErrorMessage(error));
        }
        return EMPTY;
      }),
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    const body = this.toProfileBody(request);

    return this.usersRequest<unknown>(
      AuthHttpMethod.Patch,
      UsersApiEndpoint.Profile,
      body,
    ).pipe(
      map((response) => {
        const profile = adaptUserProfileResponse(response);

        const session = this.getSession();
        if (session) {
          this.authCookieStorage.setSession({
            ...session,
            email: profile.email || session.email,
            username: profile.username || session.username,
          });
        }

        return profile;
      }),
    );
  }

  requestEmailChange(
    request: RequestEmailChangeRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.usersRequest<unknown>(
      AuthHttpMethod.Post,
      UsersApiEndpoint.EmailRequest,
      { newEmail: request.newEmail },
    );
  }

  confirmEmailChange(
    request: ConfirmEmailChangeRequest,
    newEmail?: string,
  ): Observable<UserProfile | null> {
    return this.usersRequest<unknown>(
      AuthHttpMethod.Post,
      UsersApiEndpoint.EmailConfirm,
      { code: request.code },
    ).pipe(
      map((response) => {
        let profile: UserProfile | null = null;
        try {
          profile = adaptUserProfileResponse(response);
        } catch {
          profile = null;
        }

        const session = this.getSession();
        const email = profile?.email || newEmail;
        if (session && email) {
          this.authCookieStorage.setSession({
            ...session,
            email,
            username: profile?.username || session.username,
          });
        }

        return profile;
      }),
    );
  }

  changePassword(
    request: ChangePasswordRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.usersRequest<unknown>(
      AuthHttpMethod.Post,
      UsersApiEndpoint.ChangePassword,
      request,
    );
  }

  deleteAccount(): Observable<ApiResponse<unknown>> {
    return this.usersRequest<unknown>(
      AuthHttpMethod.Delete,
      UsersApiEndpoint.Account,
    ).pipe(
      map((response) => {
        this.logout();
        return response;
      }),
    );
  }

  logout(): void {
    this.authCookieStorage.removeSession();
  }

  getSession(): AuthenticatedSession | null {
    return this.authCookieStorage.getSession();
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getRole(): Role | null {
    const session = this.getSession();

    if (!session?.token) {
      return null;
    }

    return resolveRoleFromToken(session.token);
  }

  private toProfileBody(request: UpdateProfileRequest): FormData | Record<string, string> {
    if (request.photo) {
      const formData = new FormData();
      formData.append('firstName', request.firstName);
      formData.append('lastName', request.lastName);
      formData.append('phone', request.phone);
      formData.append('photo', request.photo);
      return formData;
    }

    return {
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
    };
  }

  private authRequest<T>(
    method: AuthHttpMethod,
    endpoint: AuthApiEndpoint,
    body?: unknown,
  ): Observable<ApiResponse<T>> {
    return this.executeRequest<T>(`${this.apiUrl}/auth/${endpoint}`, method, body);
  }

  private usersRequest<T>(
    method: AuthHttpMethod,
    endpoint: UsersApiEndpoint,
    body?: unknown,
  ): Observable<ApiResponse<T>> {
    return this.executeRequest<T>(`${this.apiUrl}/users/${endpoint}`, method, body);
  }

  private executeRequest<T>(
    url: string,
    method: AuthHttpMethod,
    body?: unknown,
  ): Observable<ApiResponse<T>> {
    let call: Observable<ApiResponse<T>>;

    switch (method) {
      case AuthHttpMethod.Get:
        call = this.http.get<ApiResponse<T>>(url);
        break;
      case AuthHttpMethod.Put:
        call = this.http.put<ApiResponse<T>>(url, body);
        break;
      case AuthHttpMethod.Patch:
        call = this.http.patch<ApiResponse<T>>(url, body);
        break;
      case AuthHttpMethod.Delete:
        call = this.http.delete<ApiResponse<T>>(url);
        break;
      case AuthHttpMethod.Post:
      default:
        call = this.http.post<ApiResponse<T>>(url, body);
        break;
    }

    return call.pipe(
      map((response) => {
        if (!response.status) {
          throw new Error(response.message || 'Request failed');
        }

        return response;
      }),
      catchError((error: unknown) => {
        this.authErrorService.report(resolveAuthErrorMessage(error));
        return EMPTY;
      }),
    );
  }
}

