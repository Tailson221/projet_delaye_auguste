import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PollutionCrudComponent } from './pollution-crud';
import { mockApiInterceptor } from '../../interceptors/mock-api.interceptor';
import { PollutionService } from '../../services/pollution.service';

describe('PollutionCrudComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionCrudComponent],
      providers: [
        PollutionService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PollutionCrudComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should start in list view mode', () => {
    const fixture = TestBed.createComponent(PollutionCrudComponent);
    const component = fixture.componentInstance;
    expect(component.viewMode()).toBe('list');
  });

  it('should switch to create form view mode on openCreateForm()', () => {
    const fixture = TestBed.createComponent(PollutionCrudComponent);
    const component = fixture.componentInstance;
    component.openCreateForm();
    expect(component.viewMode()).toBe('create');
    expect(component.editingPollution()).toBeNull();
  });

  it('should switch back to list on onFormCancel()', () => {
    const fixture = TestBed.createComponent(PollutionCrudComponent);
    const component = fixture.componentInstance;
    component.openCreateForm();
    component.onFormCancel();
    expect(component.viewMode()).toBe('list');
  });
});
