import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { SESSION_STORAGE, SessionStorage } from './session-storage';

describe('SessionStorage', () => {
  let storage: SessionStorage;
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
      providers: [{ provide: SESSION_STORAGE, useValue: memory }],
    });

    storage = TestBed.inject(SessionStorage);
  });

  it('stores and reads an authenticated session', () => {
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
  });

  it('removes the stored session', () => {
    storage.setSession({
      id: '1',
      username: 'ahmed',
      email: 'ahmed@example.com',
      token: 'token-1',
    });

    storage.removeSession();

    expect(storage.getSession()).toBeNull();
  });
});
