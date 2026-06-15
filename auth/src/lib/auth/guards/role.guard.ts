import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../config/role.enum';
import { AuthActions } from '../services/auth.actions';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authActions = inject(AuthActions);
    const router = inject(Router);

    if (!authActions.isAuthenticated()) {
      return router.createUrlTree(['/auth']);
    }

    const role = authActions.getRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/home']);
  };
};
