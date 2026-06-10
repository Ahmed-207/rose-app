import { inject, Injectable, InjectionToken } from '@angular/core';
import { AuthenticatedSession } from '../models/authenticated-session.model';

export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE', {
  factory: () => sessionStorage,
});

@Injectable({
  providedIn: 'root',
})
export class SessionStorage {
  private readonly storageKey = 'authenticated-session';
  private readonly storage = inject(SESSION_STORAGE);

  setSession(session: AuthenticatedSession): void {
    this.storage.setItem(this.storageKey, JSON.stringify(session));
  }

  getSession(): AuthenticatedSession | null {
    const session = this.storage.getItem(this.storageKey);
    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session) as AuthenticatedSession;
    } catch {
      return null;
    }
  }

  removeSession(): void {
    this.storage.removeItem(this.storageKey);
  }
}
