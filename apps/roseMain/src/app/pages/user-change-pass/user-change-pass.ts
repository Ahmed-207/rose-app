import { PasswordService } from './services/password-service';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-user-change-pass',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-change-pass.html',
  styleUrl: './user-change-pass.css',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly passwordService = inject(PasswordService);

  isLoading = signal(false);

  // Eye toggle visibility signals
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Regex requiring at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  changePasswordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const rePassword = group.get('rePassword')?.value;

    if (!newPassword || !rePassword) {
      return null;
    }

    return newPassword === rePassword ? null : { passwordMismatch: true };
  }

  toggleVisibility(field: 'old' | 'new' | 'confirm'): void {
    if (field === 'old') this.showOldPassword.update((v) => !v);
    if (field === 'new') this.showNewPassword.update((v) => !v);
    if (field === 'confirm') this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.changePasswordForm.value

    this.passwordService.changePass(formValue).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.changePasswordForm.reset();
        // Handle success notification or routing here
        console.log(res)
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.log(err);
      },
    });
  }
}