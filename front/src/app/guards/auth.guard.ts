import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard CanActivate moderne protégeant l'accès aux routes nécessitant une authentification.
 * Redirige proprement vers la page d'authentification (/users) en conservant l'URL d'origine.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAuthenticated()) {
    return true;
  }

  // Redirection propre avec conservation de l'URL cible
  return router.createUrlTree(['/users'], {
    queryParams: { returnUrl: state.url, needAuth: 'true' },
  });
};
