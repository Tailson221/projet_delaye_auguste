import { Injectable, signal } from '@angular/core';
import { HttpTrafficLog } from '../models/pollution.model';

@Injectable({
  providedIn: 'root',
})
export class HttpTrafficService {
  private static readonly STORAGE_KEY_MODE = 'ecowatch_mock_mode';

  private static getInitialMockMode(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(HttpTrafficService.STORAGE_KEY_MODE);
        if (stored !== null) {
          return stored === 'true';
        }
      }
    } catch {
      // Fallback si localStorage indisponible
    }
    return true;
  }

  /**
   * Mode d'exécution de l'API :
   * - true  : Simulation locale avec l'intercepteur Mock (offline / persistance localStorage)
   * - false : Communication directe en direct avec l'API REST Node.js & PostgreSQL
   */
  readonly isMockActive = signal<boolean>(HttpTrafficService.getInitialMockMode());

  /**
   * Signal réactif contenant l'historique des requêtes et réponses HTTP
   */
  readonly logs = signal<HttpTrafficLog[]>([]);

  /**
   * Bascule entre le mode Mock local et l'API Live REST Node.js
   */
  toggleMockMode(): void {
    this.isMockActive.update((val) => {
      const next = !val;
      this.persistMode(next);
      return next;
    });
  }

  /**
   * Définit explicitement le mode
   */
  setMockMode(active: boolean): void {
    this.isMockActive.set(active);
    this.persistMode(active);
  }

  private persistMode(active: boolean): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(HttpTrafficService.STORAGE_KEY_MODE, String(active));
      }
    } catch {
      // Fallback
    }
  }

  /**
   * Enregistre une interaction HTTP
   */
  log(entry: Omit<HttpTrafficLog, 'id' | 'timestamp'>): void {
    const newEntry: HttpTrafficLog = {
      ...entry,
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
    };

    // On conserve au maximum les 15 dernières requêtes
    this.logs.update((current) => [newEntry, ...current.slice(0, 14)]);
  }

  /**
   * Efface l'historique des requêtes
   */
  clearLogs(): void {
    this.logs.set([]);
  }
}
