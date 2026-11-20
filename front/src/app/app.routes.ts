import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Configuration des routes de l'application :
 * - Chargement différé (Lazy loading via loadComponent)
 * - Route /pollutions protégée par authGuard (connexion requise pour tous les rôles)
 * - Redirection propre vers /users (onglet connexion) si non connecté
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pollutions',
    pathMatch: 'full',
  },
  {
    path: 'pollutions',
    loadComponent: () =>
      import('./components/pollution-crud/pollution-crud').then((m) => m.PollutionCrudComponent),
    canActivate: [authGuard],
    title: 'EcoWatch • Registre des Pollutions',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-management/user-management').then((m) => m.UserManagementComponent),
    title: 'EcoWatch • Authentification & Utilisateurs',
  },
  {
    path: 'login',
    redirectTo: 'users',
  },
  {
    path: '**',
    redirectTo: 'pollutions',
  },
];
