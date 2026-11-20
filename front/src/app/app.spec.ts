import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { mockApiInterceptor } from './interceptors/mock-api.interceptor';
import { HttpTrafficService } from './services/http-traffic.service';

describe('App', () => {
  let trafficService: HttpTrafficService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
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

  it('should render EcoWatch navigation and router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('EcoWatch');
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render route links for pollutions and users', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.main-tabs a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href') || links[0].getAttribute('routerlink')).toBeTruthy();
  });

  it('should allow toggling API mode', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const initialMode = app.isMockActive();
    app.toggleApiMode();
    expect(app.isMockActive()).toBe(!initialMode);
  });
});
