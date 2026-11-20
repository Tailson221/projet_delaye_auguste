import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserService } from '../services/user.service';
import { provideHttpClient } from '@angular/common/http';

describe('authGuard', () => {
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

  it('devrait autoriser la navigation si l\'utilisateur est authentifié', () => {
    userService.currentUser.set({
      id: 1,
      login: 'adelaye',
      nom: 'Delaye',
      prenom: 'Auguste',
      email: 'auguste.delaye@ecowatch.fr',
      role: 'Analyste Environnemental',
    });

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('devrait rediriger vers /users avec queryParams si non authentifié', () => {
    userService.currentUser.set(null);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state)) as any;
    expect(result.commands).toEqual(['/users']);
    expect(result.extras.queryParams).toEqual({ returnUrl: '/admin', needAuth: 'true', tab: 'login' });
  });
});
