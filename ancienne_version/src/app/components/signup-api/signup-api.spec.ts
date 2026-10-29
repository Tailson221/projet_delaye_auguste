import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SignupApiComponent } from './signup-api';
import { mockApiInterceptor } from '../../interceptors/mock-api.interceptor';
import { AuthService } from '../../services/auth.service';

describe('SignupApiComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupApiComponent],
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(SignupApiComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form by default', () => {
    const fixture = TestBed.createComponent(SignupApiComponent);
    const component = fixture.componentInstance;
    expect(component.signupForm.valid).toBe(false);
  });

  it('should prefill form with valid data when fillExample is called', () => {
    const fixture = TestBed.createComponent(SignupApiComponent);
    const component = fixture.componentInstance;
    component.fillExample('valid');
    expect(component.signupForm.valid).toBe(true);
    expect(component.signupForm.get('email')?.value).toContain('@ecowatch.org');
  });

  it('should toggle password visibility signal', () => {
    const fixture = TestBed.createComponent(SignupApiComponent);
    const component = fixture.componentInstance;
    expect(component.showPassword()).toBe(false);
    component.togglePassword();
    expect(component.showPassword()).toBe(true);
  });
});
