import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PasswordService } from './services/password-service';
import { LoadingService } from './services/loading-service';
import { passwordMatchValidator } from './utilities/pass-validator';
import { PasswordInput } from './components/password-input/password-input';

@Component({
  selector: 'app-user-change-pass',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, ToastModule, PasswordInput],
  providers: [MessageService],
  templateUrl: './user-change-pass.html',
  styleUrl: './user-change-pass.css',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly passwordService = inject(PasswordService);
  private readonly loadingService = inject(LoadingService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  // Read loading status directly from the global loading signal
  isLoading = this.loadingService.isLoading;

  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  changePasswordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.changePasswordForm.invalid || this.isLoading()) {
      return;
    }

    const formValue = this.changePasswordForm.value;

    this.passwordService.changePass(formValue).subscribe({
      next: (res) => {
        this.changePasswordForm.reset();

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('password.TOAST_SUCCESS_TITLE'),
          detail: res?.message || this.translate.instant('password.TOAST_SUCCESS_DETAIL'),
          life: 4000,
        });
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage =
          err.error?.message || this.translate.instant('password.TOAST_ERROR_DETAIL');

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('password.TOAST_ERROR_TITLE'),
          detail: errorMessage,
          life: 4000,
        });
      },
    });
  }
}