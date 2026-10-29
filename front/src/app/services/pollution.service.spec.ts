import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PollutionService } from './pollution.service';
import { mockApiInterceptor } from '../interceptors/mock-api.interceptor';
import { Pollution } from '../models/pollution.model';

describe('PollutionService', () => {
  let service: PollutionService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        PollutionService,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
      ],
    });
    service = TestBed.inject(PollutionService);
    await firstValueFrom(service.getPollutions());
  });


  it('should be created and have configured apiUrl', () => {
    expect(service).toBeTruthy();
    expect(service.apiUrl).toContain('/pollutions');
  });

  it('should fetch all pollutions via GET (Read All)', async () => {
    const list = await firstValueFrom(service.getPollutions());
    expect(list.length).toBeGreaterThan(0);
    expect(service.pollutions().length).toBe(list.length);
    expect(service.totalCount()).toBe(list.length);
  });

  it('should fetch a single pollution by ID via GET (Read One)', async () => {
    const item = await firstValueFrom(service.getPollutionById('pol_1'));
    expect(item).toBeTruthy();
    expect(item.id).toBe('pol_1');
    expect(service.selectedPollution()?.id).toBe('pol_1');
  });

  it('should create a new pollution via POST (Create)', async () => {
    const newPollution: Pollution = {
      titre: 'Test Pollution Plastique Océan',
      type: 'Plastique',
      description: 'Découverte de microplastiques sur la côte ouest.',
      dateObservation: '2026-04-12',
      lieu: 'Cap Ferret',
      latitude: 44.6289,
      longitude: -1.2464,
    };

    const created = await firstValueFrom(service.createPollution(newPollution));
    expect(created).toBeTruthy();
    expect(created.id).toBeTruthy();
    expect(created.titre).toBe(newPollution.titre);
    expect(service.pollutions().some((p) => p.id === created.id)).toBe(true);
  });

  it('should update an existing pollution via PUT (Update)', async () => {
    const updatePayload: Partial<Pollution> = {
      titre: 'Titre Modifié via PUT',
      description: 'Description mise à jour avec succès.',
    };

    const updated = await firstValueFrom(service.updatePollution('pol_2', updatePayload));
    expect(updated).toBeTruthy();
    expect(updated.titre).toBe(updatePayload.titre);
    const inSignal = service.pollutions().find((p) => p.id === 'pol_2');
    expect(inSignal?.titre).toBe(updatePayload.titre);
  });

  it('should delete a pollution via DELETE (Delete)', async () => {
    const initialList = await firstValueFrom(service.getPollutions());
    const targetId = initialList[0].id!;

    const res = await firstValueFrom(service.deletePollution(targetId));
    expect(res.success).toBe(true);
    expect(service.pollutions().some((p) => p.id === targetId)).toBe(false);
  });

  it('should dynamically filter pollutions by type and search term', async () => {
    await firstValueFrom(service.getPollutions());

    // Filtrer par type 'Plastique'
    service.updateFilter({ type: 'Plastique' });
    expect(service.filteredPollutions().every((p) => p.type === 'Plastique')).toBe(true);

    // Filtrer par terme de recherche
    service.updateFilter({ searchTerm: 'Biarritz', type: 'all' });
    expect(service.filteredPollutions().every((p) => p.lieu.includes('Biarritz') || p.titre.includes('Biarritz'))).toBe(true);
  });
});
