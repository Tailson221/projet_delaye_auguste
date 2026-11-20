import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { UserService } from '../services/user.service';
import { provideHttpClient } from '@angular/common/http';

describe('roleGuard', () => {
  let userService: UserService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        UserService,
        {
          provide: Router,
          useValue: {
            createUrlTree: (commands: any[], extras?: any) => ({ commands, extras } as any),
          },
        },
      ],
    });

    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  it('devrait rediriger vers /users si non connecté', () => {
    userService.currentUser.set(null);
    const route = { data: { role: 'Analyste Environnemental' } } as any;
    const state = { url: '/admin' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state)) as any;
    expect(result.commands).toEqual(['/users']);
  });

  it('devrait autoriser si le rôle correspond', () => {
    userService.currentUser.set({
      id: 2,
      login: 'claire_d',
      nom: 'Dupont',
      prenom: 'Claire',
      email: 'claire.dupont@ecowatch.fr',
      role: 'Éco-Citoyen',
    });

    const route = { data: { role: 'Éco-Citoyen' } } as any;
    const state = { url: '/espace-citoyen' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(true);
  });

  it('devrait toujours autoriser un Analyste Environnemental (super-rôle)', () => {
    userService.currentUser.set({
      id: 1,
      login: 'adelaye',
      nom: 'Delaye',
      prenom: 'Auguste',
      email: 'auguste.delaye@ecowatch.fr',
      role: 'Analyste Environnemental',
    });

    const route = { data: { role: 'Sentinelle de Terrain' } } as any;
    const state = { url: '/missions-terrain' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(true);
  });

  it('devrait rediriger vers /pollutions si le rôle est insuffisant', () => {
    userService.currentUser.set({
      id: 2,
      login: 'claire_d',
      nom: 'Dupont',
      prenom: 'Claire',
      email: 'claire.dupont@ecowatch.fr',
      role: 'Éco-Citoyen',
    });

    const route = { data: { role: 'Sentinelle de Terrain' } } as any;
    const state = { url: '/missions-terrain' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state)) as any;
    expect(result.commands).toEqual(['/pollutions']);
    expect(result.extras.queryParams.accessDenied).toBe('true');
  });
});
