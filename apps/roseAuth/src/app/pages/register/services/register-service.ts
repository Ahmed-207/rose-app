import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
 readonly state = signal<{ email: string; isVerified: boolean }>({
    email: '',
    isVerified: false,
  });

  setEmail(email: string) {
    this.state.update(s => ({ ...s, email }));
  }

  markVerified() {
    this.state.update(s => ({ ...s, isVerified: true }));
  }

  clear() {
    this.state.set({ email: '', isVerified: false });
  }
}
