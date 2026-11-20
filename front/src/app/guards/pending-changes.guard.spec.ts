import { TestBed } from '@angular/core/testing';
import { pendingChangesGuard, CanComponentDeactivate } from './pending-changes.guard';

describe('pendingChangesGuard', () => {
  it('devrait appeler canDeactivate du composant si la méthode existe', () => {
    const mockComponent: CanComponentDeactivate = {
      canDeactivate: () => false,
    };

    const result = TestBed.runInInjectionContext(() =>
      pendingChangesGuard(mockComponent, {} as any, {} as any, {} as any)
    );
    expect(result).toBe(false);
  });

  it('devrait renvoyer true si le composant n\'a pas de méthode canDeactivate', () => {
    const mockComponent = {} as CanComponentDeactivate;

    const result = TestBed.runInInjectionContext(() =>
      pendingChangesGuard(mockComponent, {} as any, {} as any, {} as any)
    );
    expect(result).toBe(true);
  });
});
