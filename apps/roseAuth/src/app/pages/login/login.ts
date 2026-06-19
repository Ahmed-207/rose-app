import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControlComponent, Button } from '@org/shared-ui-components';
import { AuthActions, LoginRequest } from '@org/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CheckboxModule, TranslatePipe, FormControlComponent, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {

  private readonly _fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);

  loginForm!: FormGroup;
  isLoading: WritableSignal<boolean> = signal<boolean>(false);
  loginSubscription!: Subscription;

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

    this.isLoading.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isLoading.set(false);
      return;
    }

    const request: LoginRequest = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('remember')?.value,
    };

    this.loginSubscription = this.authActions.login(request).subscribe({
      next: () => {
        this.loginSubscription.unsubscribe();
        this.router.navigateByUrl('/home');
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  goToForgotPassword(): void {
    // this.router.navigateByUrl('/auth/forgot-password');
  }

  goToRegister(): void {
    this.router.navigateByUrl('/auth/register')
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
