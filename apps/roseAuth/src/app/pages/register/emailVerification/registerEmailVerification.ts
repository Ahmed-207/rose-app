import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AuthActions, AuthErrorService } from '@org/auth';
import { Button } from '@org/shared-ui-components';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
import { FormControlComponent } from '../../../../../../shared/components/form-controls/form-control';
import { RegisterService } from '../services/register-service';

@Component({
  selector: 'app-register-email-verification',
  imports: [CommonModule, ReactiveFormsModule, FormControlComponent, Button, TranslatePipe, AuthCardComponent],
  templateUrl: './registerEmailVerification.html',
  styleUrl: './registerEmailVerification.css',
})
export class RegisterEmailVerification {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);
  private readonly registerService = inject(RegisterService);

  readonly errorMessage = this.authErrorService.message;
  readonly isLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.get('email')?.value as string;

    this.isLoading.set(true);
    this.authErrorService.clear();

    this.authActions
      .sendEmailVerification({ email })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.registerService.setEmail(email);
          void this.router.navigate(['/auth/verify-otp']);
        },
      });
  }
}
