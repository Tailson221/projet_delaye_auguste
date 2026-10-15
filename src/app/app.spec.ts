import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app';
import { mockApiInterceptor } from './interceptors/mock-api.interceptor';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render TP 03 title by default', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Inscription d'un utilisateur (API REST)");
  });

  it('should switch to TP 02 when activeTab is changed', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.activeTab = 'tp2-pollution';
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Déclarer une pollution');
  });
});

