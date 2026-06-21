import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'rose-auth.register-state';

interface RegisterState {
  email: string;
  isVerified: boolean;
}

function readState(): RegisterState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { email: '', isVerified: false };
    }
    const parsed = JSON.parse(raw) as RegisterState;
    return {
      email: parsed.email ?? '',
      isVerified: parsed.isVerified ?? false,
    };
  } catch {
    return { email: '', isVerified: false };
  }
}

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  readonly state = signal<RegisterState>(readState());

  setEmail(email: string): void {
    this.persist({ email, isVerified: false });
  }

  markVerified(): void {
    this.persist({ ...this.state(), isVerified: true });
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.state.set({ email: '', isVerified: false });
  }

  private persist(state: RegisterState): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.state.set(state);
  }
}
