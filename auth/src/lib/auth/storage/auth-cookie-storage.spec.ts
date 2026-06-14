import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  AuthCookieStorage,
  COOKIE_STORE,
  REMEMBER_ME_MAX_AGE_SECONDS,
} from './auth-cookie-storage';

describe('AuthCookieStorage', () => {
  let storage: AuthCookieStorage;
  let cookies: Map<string, { value: string; maxAgeSeconds?: number }>;

  beforeEach(() => {
    cookies = new Map();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: COOKIE_STORE,
          useValue: {
            get: (name: string) => cookies.get(name)?.value ?? null,
            set: (name: string, value: string, maxAgeSeconds?: number) => {
              cookies.set(name, { value, maxAgeSeconds });
            },
            remove: (name: string) => {
              cookies.delete(name);
            },
          },
        },
      ],
    });

    storage = TestBed.inject(AuthCookieStorage);
  });

  it('stores and reads an authenticated session in cookies', () => {
    storage.setSession({
      id: '1',
      username: 'ahmed',
      email: 'ahmed@example.com',
      token: 'token-1',
    });

    expect(storage.getSession()).toEqual({
      id: '1',
      username: 'ahmed',
      email: 'ahmed@example.com',
      token: 'token-1',
    });
    expect(cookies.get(AUTH_TOKEN_COOKIE)?.value).toBe('token-1');
    expect(cookies.get(AUTH_SESSION_COOKIE)?.value).toBe(
      JSON.stringify({
        id: '1',
        username: 'ahmed',
        email: 'ahmed@example.com',
      }),
    );
  });

  it('uses a long expiration when remember me is enabled', () => {
    storage.setSession(
      {
        id: '1',
        username: 'ahmed',
        email: 'ahmed@example.com',
        token: 'token-1',
      },
      { rememberMe: true },
    );

    expect(cookies.get(AUTH_TOKEN_COOKIE)?.maxAgeSeconds).toBe(
      REMEMBER_ME_MAX_AGE_SECONDS,
    );
    expect(cookies.get(AUTH_SESSION_COOKIE)?.maxAgeSeconds).toBe(
      REMEMBER_ME_MAX_AGE_SECONDS,
    );
  });

  it('uses a session cookie when remember me is disabled', () => {
    storage.setSession(
      {
        id: '1',
        username: 'ahmed',
        email: 'ahmed@example.com',
        token: 'token-1',
      },
      { rememberMe: false },
    );

    expect(cookies.get(AUTH_TOKEN_COOKIE)?.maxAgeSeconds).toBeUndefined();
    expect(cookies.get(AUTH_SESSION_COOKIE)?.maxAgeSeconds).toBeUndefined();
  });

  it('removes the stored session cookies', () => {
    storage.setSession({
      id: '1',
      username: 'ahmed',
      email: 'ahmed@example.com',
      token: 'token-1',
    });

    storage.removeSession();

    expect(storage.getSession()).toBeNull();
    expect(cookies.has(AUTH_TOKEN_COOKIE)).toBe(false);
    expect(cookies.has(AUTH_SESSION_COOKIE)).toBe(false);
  });
});
