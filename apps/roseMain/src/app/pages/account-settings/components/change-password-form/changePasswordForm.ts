import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions, AuthErrorService, ChangePasswordRequest } from '@org/auth';
import { Button } from 'apps/shared/components/button/button';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { finalize } from 'rxjs';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!newPassword || !confirmPassword) {
    return null;
  }
  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'account-change-password-form',
  imports: [ReactiveFormsModule, TranslatePipe, FormControlComponent, Button],
  templateUrl: './changePasswordForm.html',
  styleUrl: './changePasswordForm.css',
})
export class ChangePasswordForm {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly errorMessage = this.authErrorService.message;
  readonly isSaving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly statusMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  submit(): void {
    if (this.isSaving()) {
      return;
    }

    this.successMessage.set(null);
    this.statusMessage.set(null);
    this.authErrorService.clear();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.statusMessage.set('account.FORM_INVALID');
      return;
    }

    const value = this.form.getRawValue();
    const request: ChangePasswordRequest = {
      currentPassword: value.oldPassword,
      newPassword: value.newPassword,
      confirmPassword: value.confirmPassword,
    };

    this.isSaving.set(true);
    let finishedOk = false;
    this.authActions
      .changePassword(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSaving.set(false);
          if (!finishedOk && !this.errorMessage()) {
            this.statusMessage.set('account.SAVE_FAILED');
          }
        }),
      )
      .subscribe(() => {
        finishedOk = true;
        this.form.reset();
        this.successMessage.set('account.PASSWORD_CHANGE_SUCCESS');
        this.statusMessage.set(null);
      });
  }
}


