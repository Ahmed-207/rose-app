import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions, AuthErrorService, LoginRequest } from '@org/auth';
import { FormControlComponent, Button } from '@org/shared-ui-components';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CheckboxModule, TranslatePipe, FormControlComponent, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private readonly _fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  readonly errorMessage = this.authErrorService.message;
  isLoading: WritableSignal<boolean> = signal<boolean>(false);

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

    this.isLoading.set(true);
    this.authErrorService.clear();

    this.authActions
      .login(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
          void this.navigateAfterLogin(returnUrl);
        },
      });
  }

  goToForgotPassword(): void {
    this.router.navigateByUrl('/auth/forgot-password');
  }

  goToRegister(): void {
    void this.router.navigateByUrl('/auth/register');
  }

  private async navigateAfterLogin(returnUrl: string): Promise<void> {
    try {
      const navigated = await this.router.navigateByUrl(returnUrl);
      if (!navigated) {
        window.location.assign(new URL(returnUrl, environment.shellUrl).toString());
      }
    } catch {
      window.location.assign(new URL(returnUrl, environment.shellUrl).toString());
    }
  }
}
