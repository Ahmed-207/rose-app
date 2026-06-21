import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthErrorService {
  private readonly errorMessage = signal('');

  readonly message = this.errorMessage.asReadonly();

  report(message: string): void {
    this.errorMessage.set(message);
  }

  clear(): void {
    this.errorMessage.set('');
  }
}
