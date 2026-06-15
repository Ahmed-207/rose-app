import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControlComponent } from '@org/shared-ui-components';
import { LoginReq, UserData } from '@org/auth-data'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CheckboxModule, TranslatePipe, FormControlComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [CookieService]
})
export class Login implements OnInit {

  private readonly _fb = inject(FormBuilder);
  private readonly userService = inject(UserData);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);
  loginForm!: FormGroup;
  userToken: WritableSignal<string> = signal('');

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
    if (this.loginForm.valid) {
      const userData: LoginReq = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      }
      this.sendLoginReq(userData, this.loginForm.get('remember')?.value);
    } else {
      this.loginForm.markAllAsTouched();
      console.log('rejected');
    }
  }

  sendLoginReq(userData: LoginReq, remember: boolean): void {

    this.userService.login(userData).subscribe({
      next: (res) => {
        console.log(res);
        this.userService.isLoggedIn.set(true);
        this.userToken.set(res.payload.token);
        this.router.navigateByUrl('/home');
        if (remember) {
          this.cookieService.set('token', res.payload.token, {
            expires: 180,
            path: '/',
            secure: true,
            sameSite: 'Lax'
          });
          this.cookieService.set('userSavedData', JSON.stringify(res.payload.user), {
            expires: 180,
            path: '/',
            secure: true,
            sameSite: 'Lax'
          })
        } else {
          this.cookieService.set('token', res.payload.token, {
            path: '/',
            secure: true,
            sameSite: 'Lax'
          });
          this.cookieService.set('userSavedData', JSON.stringify(res.payload.user), {
            path: '/',
            secure: true,
            sameSite: 'Lax'
          })

        }
      },
      error: (err) => {
        console.log(err)
      }
    })

  }

  goToForgotPassword(): void {
    // this.router.navigateByUrl('/auth/forgot-password');
  }

  goToRegister(): void {
    // this.router.navigateByUrl('/auth/register');
  }

}



/*

refactored code for using auth lib 

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
    // this.router.navigateByUrl('/auth/forgot-password');
  }

  goToRegister(): void {
    // this.router.navigateByUrl('/auth/register');
  }
}


*/