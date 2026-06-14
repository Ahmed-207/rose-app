import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register-service';
import {FormControlComponent} from '../../../../../../shared/components/form-controls/form-control';
import {Button} from '@org/shared-ui-components';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
@Component({
  selector: 'app-register-email-verification',
  imports: [CommonModule,ReactiveFormsModule,FormControlComponent,Button,TranslatePipe,AuthCardComponent],
  templateUrl: './registerEmailVerification.html',
  styleUrl: './registerEmailVerification.css',
})
export class RegisterEmailVerification {
  private fb = inject(FormBuilder);
  // private _authService= inject(AuthService);
  // private _router = inject(Router);
  // private _registrationService = inject(RegisterService);
  errorMessage = '';
  isLoading = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailControl() {
    return this.form.get('email')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const email = this.emailControl.value!;
    // this._authService.emailVerification({ email }).subscribe({
    //   next: (res) => {
    //     this.isLoading = false;
    //     if (res.status) {
    //       this._registrationService.setEmail(email); // save to signal
    //       this._router.navigate(['/auth/verify-otp']);
    //     } else {
    //       this.errorMessage = res.message;
    //     }
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     this.errorMessage =
    //       err.error?.message ?? 'Something went wrong. Please try again.';
    //   },
    // });
  }
}
