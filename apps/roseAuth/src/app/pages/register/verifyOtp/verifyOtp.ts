import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/shared-ui-components';
import { RegisterService } from '../services/register-service';
import { Router } from '@angular/router';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
import { AuthActions } from '@org/auth';

@Component({
  selector: 'app-verify-otp',
  imports: [CommonModule,ReactiveFormsModule,Button,TranslatePipe,AuthCardComponent],
  templateUrl: './verifyOtp.html',
  styleUrl: './verifyOtp.css',
})
export class VerifyOtp {
 private authActions = inject(AuthActions);
  private _router = inject(Router);
   private _registrationService = inject(RegisterService);

  readonly email = computed(() => this._registrationService.state().email);
  digits = signal<string[]>(['', '', '', '', '', '']);

  isLoading = false;
  errorMessage = '';

  private inputs = viewChildren<ElementRef<HTMLInputElement>>('digitInput');

  private get otpValue(): string {
    return this.digits().join('');
  }

  get isComplete(): boolean {
    return this.otpValue.length === 6 && this.digits().every(d => d !== '');
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

    // Focus the next empty slot or last slot
    const nextEmpty = updated.findIndex(d => d === '');
    this.focusInput(nextEmpty === -1 ? 5 : nextEmpty);
  }

  private focusInput(index: number): void {
    const inputList = this.inputs();
    inputList[index]?.nativeElement.focus();
  }

  onSubmit(): void {
    if (!this.isComplete) return;

    this.isLoading=true;

   this.authActions.confirmEmailVerification({
      email: this.email(),
      code: this.otpValue,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status) {
          this._registrationService.markVerified();
          this._router.navigate(['/auth/register']);
        } else {
          this.errorMessage = res.message;
          this.clearDigits();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Invalid code. Please try again.';
        this.clearDigits();
      },
    });
  }




  private clearDigits(): void {
    this.digits.set(['', '', '', '', '', '']);
    this.focusInput(0);
  }


}
