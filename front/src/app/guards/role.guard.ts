import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/user.model';

/**
 * Guard CanActivate contrôlant l'accès en fonction des rôles autorisés (RBAC)
 * configurés dans route.data['role'] ou route.data['roles'].
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const currentUser = userService.currentUser();

  // Si l'utilisateur n'est pas connecté, redirection vers /users
  if (!currentUser) {
    return router.createUrlTree(['/users'], {
      queryParams: { returnUrl: state.url, needAuth: 'true' },
    });
  }

  const expectedRole = route.data?.['role'] as UserRole | undefined;
  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;

  let hasRole = true;

  if (expectedRole) {
    hasRole = currentUser.role === expectedRole || currentUser.role === 'Analyste Environnemental';
  } else if (expectedRoles && expectedRoles.length > 0) {
    hasRole = expectedRoles.includes(currentUser.role as UserRole) || currentUser.role === 'Analyste Environnemental';
  }

  if (hasRole) {
    return true;
  }

  // Redirection propre si droits insuffisants
  return router.createUrlTree(['/pollutions'], {
    queryParams: { accessDenied: 'true', requiredRole: expectedRole || expectedRoles?.join(',') },
  });
};
