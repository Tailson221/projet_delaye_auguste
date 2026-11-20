import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard CanActivate protégeant l'accès aux routes nécessitant une authentification (ex: /pollutions).
 * Seules les personnes connectées (quel que soit leur rôle) peuvent y accéder.
 * Si l'utilisateur n'est pas connecté, il est redirigé immédiatement vers l'onglet de connexion.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAuthenticated()) {
    return true;
  }

  // Redirection propre vers la page d'authentification sur l'onglet de connexion
  return router.createUrlTree(['/users'], {
    queryParams: {
      returnUrl: state.url,
      needAuth: 'true',
      tab: 'login',
    },
  });
};
