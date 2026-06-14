import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthActions } from '../services/auth.actions';

export const authGuard: CanActivateFn = () => {
  const authActions = inject(AuthActions);
  const router = inject(Router);

  if (authActions.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth']);
};
