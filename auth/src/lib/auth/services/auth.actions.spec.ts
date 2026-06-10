import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AUTH_API_BASE, AuthApiEndpoint } from '../config/enums';
import { SESSION_STORAGE, SessionStorage } from '../storage/session-storage';
import { AuthActions } from './auth.actions';

describe('AuthActions', () => {
  let authActions: AuthActions;
  let httpMock: HttpTestingController;
  let memory: Storage;

  beforeEach(() => {
    const store = new Map<string, string>();

    memory = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key) => store.get(key) ?? null,
      key: () => null,
      removeItem: (key) => {
        store.delete(key);
      },
      setItem: (key, value) => {
        store.set(key, value);
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SESSION_STORAGE, useValue: memory },
      ],
    });

    authActions = TestBed.inject(AuthActions);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends email verification OTP', () => {
    authActions
      .sendEmailVerification({ email: 'user@example.com' })
      .subscribe((response) => {
        expect(response.message).toBe('OTP sent');
      });

    const request = httpMock.expectOne(
      `${AUTH_API_BASE}/${AuthApiEndpoint.SendEmailVerification}`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'user@example.com' });

    request.flush({
      status: true,
      code: 200,
      message: 'OTP sent',
      data: {},
    });
  });

  it('confirms email verification code', () => {
    authActions
      .confirmEmailVerification({
        email: 'user@example.com',
        code: '123456',
      })
      .subscribe((response) => {
        expect(response.message).toBe('Email verified');
      });

    const request = httpMock.expectOne(
      `${AUTH_API_BASE}/${AuthApiEndpoint.ConfirmEmailVerification}`,
    );

    expect(request.request.body).toEqual({
      email: 'user@example.com',
      code: '123456',
    });

    request.flush({
      status: true,
      code: 200,
      message: 'Email verified',
      data: {},
    });
  });

  it('registers and stores the authenticated session', () => {
    authActions
      .register({
        username: 'new-user',
        email: 'new@example.com',
        password: 'secret',
        confirmPassword: 'secret',
        firstName: 'New',
        lastName: 'User',
      })
      .subscribe((session) => {
        expect(session.username).toBe('new-user');
      });

    const request = httpMock.expectOne(
      `${AUTH_API_BASE}/${AuthApiEndpoint.Register}`,
    );

    request.flush({
      status: true,
      code: 201,
      message: 'Registered',
      data: {
        token: 'register-token',
        user: {
          id: 'user-2',
          username: 'new-user',
          email: 'new@example.com',
        },
      },
    });
  });

  it('logs in and stores the authenticated session', () => {
    authActions
      .login({ username: 'ahmed', password: 'secret' })
      .subscribe((session) => {
        expect(session).toEqual({
          id: 'user-1',
          username: 'ahmed',
          email: 'ahmed@example.com',
          token: 'jwt-token',
        });
      });

    const request = httpMock.expectOne(
      `${AUTH_API_BASE}/${AuthApiEndpoint.Login}`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      username: 'ahmed',
      password: 'secret',
    });

    request.flush({
      status: true,
      code: 200,
      message: 'Login successful',
      data: {
        accessToken: 'jwt-token',
        user: {
          id: 'user-1',
          username: 'ahmed',
          email: 'ahmed@example.com',
        },
      },
    });

    expect(TestBed.inject(SessionStorage).getSession()?.token).toBe('jwt-token');
  });

  it('requests a password reset email', () => {
    authActions
      .forgotPassword({ email: 'user@example.com' })
      .subscribe((response) => {
        expect(response.message).toBe('Reset email sent');
      });

    const request = httpMock.expectOne(
      `${AUTH_API_BASE}/${AuthApiEndpoint.ForgotPassword}`,
    );

    expect(request.request.body).toEqual({ email: 'user@example.com' });

    request.flush({
      status: true,
      code: 200,
      message: 'Reset email sent',
      data: {},
    });
  });

  it('resets the password with a token', () => {
    authActions
      .resetPassword({
        token: 'reset-token',
        newPassword: 'new-secret',
        confirmPassword: 'new-secret',
      })
      .subscribe((response) => {
        expect(response.message).toBe('Password reset');
      });

    const request = httpMock.expectOne(
      `${AUTH_API_BASE}/${AuthApiEndpoint.ResetPassword}`,
    );

    expect(request.request.body).toEqual({
      token: 'reset-token',
      newPassword: 'new-secret',
      confirmPassword: 'new-secret',
    });

    request.flush({
      status: true,
      code: 200,
      message: 'Password reset',
      data: {},
    });
  });

  it('logs out by clearing the stored session', () => {
    TestBed.inject(SessionStorage).setSession({
      id: 'user-1',
      username: 'ahmed',
      email: 'ahmed@example.com',
      token: 'jwt-token',
    });

    authActions.logout();

    expect(authActions.getSession()).toBeNull();
    expect(authActions.isAuthenticated()).toBe(false);
  });
});
