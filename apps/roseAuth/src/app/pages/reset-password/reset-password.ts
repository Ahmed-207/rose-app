import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions, ResetPasswordRequest } from '@org/auth';
import { FormControlComponent } from '@org/shared-ui-components';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, TranslatePipe, FormControlComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly isSuccess = signal(false);
  readonly tokenMissing = signal(false);

  token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );

    if (!this.token) {
      this.tokenMissing.set(true);
    }
  }

  get passwordMismatch(): boolean {
    return (
      !!this.resetPasswordForm.get('confirmPassword')?.touched &&
      this.resetPasswordForm.hasError('passwordMismatch')
    );
  }

  submitResetPassword(): void {
    if (this.isLoading()) {
      return;
    }

    if (!this.token) {
      return;
    }

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.isSuccess.set(false);

    const request: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.resetPasswordForm.get('newPassword')?.value,
      confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value,
    };

    this.authActions.resetPassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        void this.router.navigateByUrl('/auth/login');
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
