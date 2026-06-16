import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions, ForgotPasswordRequest } from '@org/auth';
import { FormControlComponent } from '@org/shared-ui-components';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, TranslatePipe, FormControlComponent],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);

  forgotPasswordForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.get('email')?.value,
    };

    this.authActions.forgotPassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        void this.router.navigate(['/auth/forgot-password/sent'], {
          state: { email: request.email },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }
}
