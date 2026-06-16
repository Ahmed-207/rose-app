import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControlComponent } from '@org/shared-ui-components';
import { AuthActions, LoginRequest } from '@org/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CheckboxModule, TranslatePipe, FormControlComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private readonly _fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);

  loginForm!: FormGroup;

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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('remember')?.value,
    };

    this.authActions.login(request).subscribe({
      next: () => {
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        console.log(err);
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