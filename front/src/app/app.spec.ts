import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app';
import { mockApiInterceptor } from './interceptors/mock-api.interceptor';
import { HttpTrafficService } from './services/http-traffic.service';

describe('App', () => {
  let trafficService: HttpTrafficService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        HttpTrafficService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    }).compileComponents();

    trafficService = TestBed.inject(HttpTrafficService);
    trafficService.setMockMode(true);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render TP 04 Pollutions manager by default', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('EcoWatch');
    expect(compiled.querySelector('app-pollution-crud')).toBeTruthy();
  });

  it('should switch to Users tab when requested', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.switchTab('users');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-user-management')).toBeTruthy();
  });
});
