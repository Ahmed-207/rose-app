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
import { finalize } from 'rxjs';
import { AuthActions, ResetPasswordRequest } from '@org/auth';
import { AppToastService, FormControlComponent } from '@org/shared-ui-components';

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
  private readonly toast = inject(AppToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm!: FormGroup;
  readonly isLoading = signal(false);
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
    this.isSuccess.set(false);

    const request: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.resetPasswordForm.get('newPassword')?.value,
      confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value,
    };

    this.authActions
      .resetPassword(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.toast.success('toast.PASSWORD_RESET_SUCCESS');
          void this.router.navigateByUrl('/auth/login');
        },
      });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }
}
