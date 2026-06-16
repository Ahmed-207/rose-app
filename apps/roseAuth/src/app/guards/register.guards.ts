import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RegisterService } from '../pages/register/services/register-service';

export const registerEmailGuard: CanActivateFn = () => {
  const registerService = inject(RegisterService);
  const router = inject(Router);

  if (registerService.state().email) {
    return true;
  }

  return router.createUrlTree(['/auth/send-email-verification']);
};

export const registerVerifiedGuard: CanActivateFn = () => {
  const registerService = inject(RegisterService);
  const router = inject(Router);
  const state = registerService.state();

  if (state.email && state.isVerified) {
    return true;
  }

  if (!state.email) {
    return router.createUrlTree(['/auth/send-email-verification']);
  }

  return router.createUrlTree(['/auth/verify-otp']);
};
