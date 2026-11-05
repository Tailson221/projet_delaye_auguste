import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { UserManagementComponent } from './user-management';
import { UserService } from '../../services/user.service';
import { mockApiInterceptor } from '../../interceptors/mock-api.interceptor';
import { HttpTrafficService } from '../../services/http-traffic.service';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let trafficService: HttpTrafficService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        UserService,
        HttpTrafficService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    }).compileComponents();

    trafficService = TestBed.inject(HttpTrafficService);
    trafficService.setMockMode(true);

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with list tab active', () => {
    expect(component.activeTab()).toBe('list');
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
