import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { mockApiInterceptor } from '../interceptors/mock-api.interceptor';
import { UserSignupRequest } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created via dependency injection', () => {
    expect(service).toBeTruthy();
    expect(service.apiUrl).toBeTruthy();
  });

  it('should fetch mock users via GET request and update users signal', async () => {
    const users = await firstValueFrom(service.fetchUsers());
    expect(users.length).toBeGreaterThan(0);
    expect(service.users().length).toBe(users.length);
    expect(service.totalUsersCount()).toBe(users.length);
  });

  it('should register a new user successfully via POST', async () => {
    const rand = Math.floor(Math.random() * 10000);
    const newUser: UserSignupRequest = {
      login: `testuser_${rand}`,
      nom: 'TestNom',
      prenom: 'TestPrenom',
      email: `test_${rand}@domain.com`,
      password: 'SecurePassword123!',
      role: 'Éco-Citoyen',
      newsletter: true,
    };

    const res = await firstValueFrom(service.signup(newUser));
    expect(res).toBeTruthy();
    expect(res.id).toBeTruthy();
    expect(res.token).toContain('jwt.mock');
    expect(service.lastRegisteredUser()?.login).toBe(newUser.login);
  });

  it('should return error when simulating conflict', async () => {
    const duplicateUser: UserSignupRequest = {
      login: 'claire.sentinelle',
      nom: 'Martin',
      prenom: 'Claire',
      email: 'claire.martin@ecowatch.org',
      password: 'Password123!',
      role: 'Sentinelle de Terrain',
    };

    let hasThrown = false;
    try {
      await firstValueFrom(service.signup(duplicateUser, 'conflict'));
    } catch (err: unknown) {
      hasThrown = true;
      expect(String(err)).toContain('409');
      expect(service.lastError()).toContain('409');
    }
    expect(hasThrown).toBe(true);
  });
});

