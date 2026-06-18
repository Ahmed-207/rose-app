import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AuthActions, AuthErrorService, ForgotPasswordRequest } from '@org/auth';
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
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);

  forgotPasswordForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = this.authErrorService.message;

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submitForgotPassword(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authErrorService.clear();

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.get('email')?.value,
      redirectUrl: `${window.location.origin}/auth/reset-password`,
    };

    this.authActions
      .forgotPassword(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/auth/forgot-password/sent'], {
            state: { email: request.email },
          });
        },
      });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }
}
