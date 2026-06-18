import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControlComponent } from '@org/shared-ui-components';
import { AuthActions, AuthErrorService, LoginRequest } from '@org/auth';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CheckboxModule, TranslatePipe, FormControlComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private readonly _fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);

  loginForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = this.authErrorService.message;

  ngOnInit(): void {
    this.initiateLoginForm();
  }

  initiateLoginForm(): void {
    this.loginForm = this._fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false],
    });
  }

  submitLogin(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('remember')?.value,
    };

    this.isLoading.set(true);
    this.authErrorService.clear();

    this.authActions
      .login(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/home');
        },
      });
  }

  goToForgotPassword(): void {
    this.router.navigateByUrl('/auth/forgot-password');
  }

  goToRegister(): void {
    this.router.navigateByUrl('/auth/send-email-verification');
  }
}
