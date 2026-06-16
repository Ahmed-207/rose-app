import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions } from '@org/auth';
import { Button } from '@org/shared-ui-components';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
import { RegisterService } from '../services/register-service';

@Component({
  selector: 'app-verify-otp',
  imports: [CommonModule, ReactiveFormsModule, Button, TranslatePipe, AuthCardComponent, RouterLink],
  templateUrl: './verifyOtp.html',
  styleUrl: './verifyOtp.css',
})
export class VerifyOtp {
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);
  private readonly registerService = inject(RegisterService);

  readonly email = computed(() => this.registerService.state().email);
  readonly digits = signal<string[]>(['', '', '', '', '', '']);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('digitInput');

  private get otpValue(): string {
    return this.digits().join('');
  }

  get isComplete(): boolean {
    return this.otpValue.length === 6 && this.digits().every((d) => d !== '');
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);

    const updated = [...this.digits()];
    updated[index] = val;
    this.digits.set(updated);

    if (val && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const updated = [...this.digits()];
      if (updated[index]) {
        updated[index] = '';
        this.digits.set(updated);
      } else if (index > 0) {
        updated[index - 1] = '';
        this.digits.set(updated);
        this.focusInput(index - 1);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    if (!pasted) return;

    const updated = ['', '', '', '', '', ''];
    pasted.split('').forEach((char, i) => (updated[i] = char));
    this.digits.set(updated);

    const nextEmpty = updated.findIndex((d) => d === '');
    this.focusInput(nextEmpty === -1 ? 5 : nextEmpty);
  }

  private focusInput(index: number): void {
    const inputList = this.inputs();
    inputList[index]?.nativeElement.focus();
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    if (!this.isComplete) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authActions
      .confirmEmailVerification({
        email: this.email(),
        code: this.otpValue,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.registerService.markVerified();
          void this.router.navigate(['/auth/register']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message ?? 'Invalid code. Please try again.');
          this.clearDigits();
        },
      });
  }

  private clearDigits(): void {
    this.digits.set(['', '', '', '', '', '']);
    this.focusInput(0);
  }
}
