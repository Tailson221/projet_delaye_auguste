import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { mockApiInterceptor } from '../interceptors/mock-api.interceptor';
import { HttpTrafficService } from './http-traffic.service';

describe('UserService', () => {
  let service: UserService;
  let trafficService: HttpTrafficService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        HttpTrafficService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    });
    service = TestBed.inject(UserService);
    trafficService = TestBed.inject(HttpTrafficService);
    trafficService.setMockMode(true);
  });

  it('should be created and have configured apiUrl', () => {
    expect(service).toBeTruthy();
    expect(service.apiUrl).toContain('/users');
  });

  it('should fetch all users via GET /api/users', async () => {
    const list = await firstValueFrom(service.getUsers());
    expect(list.length).toBeGreaterThan(0);
    expect(service.users().length).toBe(list.length);
    expect(service.totalUsersCount()).toBe(list.length);
  });

  it('should fetch a single user by ID via GET /api/users/:id', async () => {
    const user = await firstValueFrom(service.getUserById(1));
    expect(user).toBeTruthy();
    expect(user.id).toBe(1);
    expect(user.login).toBe('adelaye');
  });

  it('should create a new user via POST /api/users', async () => {
    const newUser = await firstValueFrom(
      service.createUser({
        login: `test_user_${Date.now()}`,
        nom: 'Martin',
        prenom: 'Lucie',
        email: `lucie.${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'Éco-Citoyen',
      })
    );

    expect(newUser).toBeTruthy();
    expect(newUser.login).toContain('test_user_');
    expect(service.currentUser()?.login).toBe(newUser.login);
    expect(service.users().some((u) => u.login === newUser.login)).toBe(true);
  });

  it('should authenticate user via POST /api/users/login', async () => {
    const authRes = await firstValueFrom(
      service.login({
        login: 'adelaye',
        password: 'Password123!',
      })
    );

    expect(authRes).toBeTruthy();
    expect(authRes.token).toBeTruthy();
    expect(service.currentUser()?.login).toBe('adelaye');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should delete a user via DELETE /api/users/:id', async () => {
    // Création d'un utilisateur temporaire pour le test de suppression
    const tempUser = await firstValueFrom(
      service.createUser({
        login: `to_delete_${Date.now()}`,
        nom: 'Temp',
        prenom: 'User',
        email: `temp.${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'Éco-Citoyen',
      })
    );

    const initialCount = service.users().length;
    const deleteRes = await firstValueFrom(service.deleteUser(tempUser.id));

    expect(deleteRes.message).toBeTruthy();
    expect(service.users().length).toBe(initialCount - 1);
    expect(service.users().some((u) => u.id === tempUser.id)).toBe(false);
  });
});

