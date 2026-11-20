import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;
}

/**
 * Guard CanDeactivate empêchant la perte de modifications non enregistrées
 * lors d'une navigation involontaire.
 */
export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component && typeof component.canDeactivate === 'function') {
    return component.canDeactivate();
  }
  return true;
};
