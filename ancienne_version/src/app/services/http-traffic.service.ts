import { Injectable, signal } from '@angular/core';
import { HttpTrafficLog } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class HttpTrafficService {
  /**
   * Signal réactif contenant l'historique des requêtes et réponses HTTP
   */
  readonly logs = signal<HttpTrafficLog[]>([]);

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
