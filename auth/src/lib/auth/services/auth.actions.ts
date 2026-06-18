import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthErrorService } from './auth-error.service';
import { resolveAuthErrorMessage } from '../utils/resolve-auth-error-message';
import { API_URL } from '../config/api';
import { AuthApiEndpoint } from '../config/enums';
import { Role } from '../config/role.enum';
import { ApiResponse } from '../models/api-response.model';
import { AuthenticatedSession } from '../models/authenticated-session.model';
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
import { AuthCookieStorage } from '../storage/auth-cookie-storage';
import { adaptLoginResponse } from '../utils/adapters/login.adapter';
import { adaptRegisterResponse } from '../utils/adapters/register.adapter';
import { resolveRoleFromToken } from '../utils/jwt.util';

@Injectable({
  providedIn: 'root',
})
export class AuthActions {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly authCookieStorage = inject(AuthCookieStorage);
  private readonly authErrorService = inject(AuthErrorService);

  sendEmailVerification(
    request: SendEmailVerificationRequest,
  ): Observable<ApiResponse<SendEmailVerificationResponseData>> {
    return this.post<SendEmailVerificationResponseData>(
      AuthApiEndpoint.SendEmailVerification,
      request,
    );
  }

  confirmEmailVerification(
    request: ConfirmEmailVerificationRequest,
  ): Observable<ApiResponse<ConfirmEmailVerificationResponseData>> {
    return this.post<ConfirmEmailVerificationResponseData>(
      AuthApiEndpoint.ConfirmEmailVerification,
      request,
    );
  }

  register(request: RegisterRequest): Observable<AuthenticatedSession> {
    return this.post<RegisterResponseData>(AuthApiEndpoint.Register, request).pipe(
      map((response) => {
        const session = adaptRegisterResponse(response);
        this.authCookieStorage.setSession(session);
        return session;
      }),
    );
  }

  login(request: LoginRequest): Observable<AuthenticatedSession> {
    const { rememberMe, ...credentials } = request;

    return this.post<LoginResponseData>(AuthApiEndpoint.Login, credentials).pipe(
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
    return this.post<ForgotPasswordResponseData>(
      AuthApiEndpoint.ForgotPassword,
      request,
    );
  }

  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<ApiResponse<ResetPasswordResponseData>> {
    return this.post<ResetPasswordResponseData>(
      AuthApiEndpoint.ResetPassword,
      request,
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

  private post<T>(
    endpoint: AuthApiEndpoint,
    body: unknown,
  ): Observable<ApiResponse<T>> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}/api/auth/${endpoint}`, body)
      .pipe(
        map((response) => {
          if (!response.status) {
            throw new Error(response.message || 'Request failed');
          }

          return response;
        }),
        catchError((error: unknown) => {
          if (!(error instanceof HttpErrorResponse)) {
            this.authErrorService.report(resolveAuthErrorMessage(error));
          }

          return EMPTY;
        }),
      );
  }
}
