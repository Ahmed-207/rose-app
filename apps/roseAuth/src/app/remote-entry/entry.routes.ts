import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { ForgotPassword } from '../pages/forgot-password/forgot-password';
import { ForgotPasswordSent } from '../pages/forgot-password/forgot-password-sent';
import { Login } from '../pages/login/login';
import { RegisterEmailVerification } from '../pages/register/emailVerification/registerEmailVerification';
import { Register } from '../pages/register/registerForm/register';
import { ResetPassword } from '../pages/reset-password/reset-password';
import { VerifyOtp } from '../pages/register/verifyOtp/verifyOtp';

export const remoteRoutes: Route[] = [{
    path: '',
    component: RemoteEntry,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'forgot-password', component: ForgotPassword },
      { path: 'forgot-password/sent', component: ForgotPasswordSent },
      { path: 'reset-password', component: ResetPassword },
      { path: 'send-email-verification', component: RegisterEmailVerification },
      { path: 'verify-otp', component: VerifyOtp },
      { path: 'register', component: Register },
    ],
  },
];
