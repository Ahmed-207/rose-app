import { inject, Injectable, InjectionToken } from '@angular/core';
import { AuthenticatedSession } from '../models/authenticated-session.model';

export const AUTH_TOKEN_COOKIE = 'rose-auth-token';
export const AUTH_SESSION_COOKIE = 'rose-auth-session';
export const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface AuthSessionStorageOptions {
  rememberMe?: boolean;
}

export interface CookieStore {
  get(name: string): string | null;
  set(name: string, value: string, maxAgeSeconds?: number): void;
  remove(name: string): void;
}

function createBrowserCookieStore(): CookieStore {
  return {
    get(name) {
      if (typeof document === 'undefined') {
        return null;
      }

      const match = document.cookie.match(
        new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
      );

      return match ? decodeURIComponent(match[1]) : null;
    },
    set(name, value, maxAgeSeconds) {
      if (typeof document === 'undefined') {
        return;
      }

      const encodedValue = encodeURIComponent(value);
      let cookie = `${name}=${encodedValue}; path=/; samesite=lax`;

      if (maxAgeSeconds !== undefined) {
        cookie += `; max-age=${maxAgeSeconds}`;
      }

      if (window.location.protocol === 'https:') {
        cookie += '; secure';
      }

      document.cookie = cookie;
    },
    remove(name) {
      if (typeof document === 'undefined') {
        return;
      }

      document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
    },
  };
}

export const COOKIE_STORE = new InjectionToken<CookieStore>('COOKIE_STORE', {
  factory: () => createBrowserCookieStore(),
});

@Injectable({
  providedIn: 'root',
})
export class AuthCookieStorage {
  private readonly cookieStore = inject(COOKIE_STORE);

  setSession(
    session: AuthenticatedSession,
    options: AuthSessionStorageOptions = {},
  ): void {
    const maxAge = options.rememberMe ? REMEMBER_ME_MAX_AGE_SECONDS : undefined;

    this.cookieStore.set(AUTH_TOKEN_COOKIE, session.token, maxAge);
    this.cookieStore.set(
      AUTH_SESSION_COOKIE,
      JSON.stringify({
        id: session.id,
        username: session.username,
        email: session.email,
      }),
      maxAge,
    );
  }

  getSession(): AuthenticatedSession | null {
    const token = this.cookieStore.get(AUTH_TOKEN_COOKIE);
    if (!token) {
      return null;
    }

    const sessionData = this.cookieStore.get(AUTH_SESSION_COOKIE);
    if (!sessionData) {
      return null;
    }

    try {
      const { id, username, email } = JSON.parse(sessionData) as Pick<
        AuthenticatedSession,
        'id' | 'username' | 'email'
      >;

      if (!id || !username || !email) {
        return null;
      }

      return { id, username, email, token };
    } catch {
      return null;
    }
  }

  removeSession(): void {
    this.cookieStore.remove(AUTH_TOKEN_COOKIE);
    this.cookieStore.remove(AUTH_SESSION_COOKIE);
  }
}
