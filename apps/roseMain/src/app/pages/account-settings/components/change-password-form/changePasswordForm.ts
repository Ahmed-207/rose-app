import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions, ChangePasswordRequest } from '@org/auth';
import { AppToastService } from '@org/shared-ui-components';
import { Button } from 'apps/shared/components/button/button';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { passwordMatchValidator } from 'apps/shared/utils/passwordMatchValidator';
import { finalize } from 'rxjs';

@Component({
  selector: 'account-change-password-form',
  imports: [ReactiveFormsModule, TranslatePipe, FormControlComponent, Button],
  templateUrl: './changePasswordForm.html',
  styleUrl: './changePasswordForm.css',
})
export class ChangePasswordForm {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly toast = inject(AppToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSaving = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') },
  );

  submit(): void {
    if (this.isSaving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('account.FORM_INVALID');
      return;
    }

    const value = this.form.getRawValue();
    const request: ChangePasswordRequest = {
      currentPassword: value.oldPassword,
      newPassword: value.newPassword,
      confirmPassword: value.confirmPassword,
    };

    this.isSaving.set(true);
    this.authActions
      .changePassword(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe(() => {
        this.form.reset();
        this.toast.success('toast.PASSWORD_CHANGED');
      });
  }
}
