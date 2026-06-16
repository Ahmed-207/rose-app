import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { VerifyOtp } from '../pages/register/verifyOtp/verifyOtp';
import { Register } from '../pages/register/registerForm/register';
import { RegisterEmailVerification } from '../pages/register/emailVerification/registerEmailVerification';

export const remoteRoutes: Route[] = [{
    path: '',
    component: RemoteEntry,
    children: [
      { path: '', redirectTo: 'send-email-verification', pathMatch: 'full' },
      { path: 'send-email-verification', component: RegisterEmailVerification },
      { path: 'verify-otp',  component: VerifyOtp },
      { path: 'register',   component: Register },
    ],
  },
];
