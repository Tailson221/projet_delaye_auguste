import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserManagementComponent } from './user-management';
import { UserService } from '../../services/user.service';
import { mockApiInterceptor } from '../../interceptors/mock-api.interceptor';
import { HttpTrafficService } from '../../services/http-traffic.service';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userService: UserService;
  let trafficService: HttpTrafficService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        provideRouter([]),
        UserService,
        HttpTrafficService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService);
    trafficService = TestBed.inject(HttpTrafficService);
    trafficService.setMockMode(true);
    userService.logout();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with login tab active when unauthenticated', () => {
    expect(component.activeTab()).toBe('login');
  });

  it('should refuse switching to list tab when unauthenticated and set notice', () => {
    component.selectTab('list');
    expect(component.activeTab()).toBe('login');
    expect(component.authNotice()).toContain('Accès protégé');
  });

  it('should allow switching to list tab when authenticated', () => {
    userService.currentUser.set({
      id: 1,
      login: 'adelaye',
      nom: 'Delaye',
      prenom: 'Auguste',
      email: 'auguste@ecowatch.fr',
      role: 'Éco-Citoyen',
    });

    component.selectTab('list');
    expect(component.activeTab()).toBe('list');
    expect(component.authNotice()).toBeNull();
  });

  it('should have invalid form initially for signup', () => {
    expect(component.signupForm.valid).toBe(false);
  });

  it('should validate password match', () => {
    component.signupForm.patchValue({
      login: 'validuser',
      nom: 'Nom',
      prenom: 'Prenom',
      email: 'test@example.com',
      role: 'Éco-Citoyen',
      password: 'Password123!',
      confirmPassword: 'Password456!',
    });

    expect(component.signupForm.errors?.['passwordMismatch']).toBe(true);

    component.signupForm.patchValue({
      confirmPassword: 'Password123!',
    });

    expect(component.signupForm.errors?.['passwordMismatch']).toBeFalsy();
  });
});
