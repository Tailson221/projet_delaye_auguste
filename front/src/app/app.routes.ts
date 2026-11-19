import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

/**
 * Configuration des routes de l'application avec :
 * - Chargement différé (Lazy loading via loadComponent)
 * - Protection par Guards (authGuard, roleGuard)
 * - Redirections propres
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
    title: 'EcoWatch • Registre des Pollutions',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-management/user-management').then((m) => m.UserManagementComponent),
    title: 'EcoWatch • Gestion des Utilisateurs',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/user-management/user-management').then((m) => m.UserManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'Analyste Environnemental' },
    title: 'EcoWatch • Administration (Protégée par Guards)',
  },
  {
    path: '**',
    redirectTo: 'pollutions',
  },
];
