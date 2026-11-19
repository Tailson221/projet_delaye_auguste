import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution, PollutionFilterCriteria } from '../models/pollution.model';

@Injectable({
  providedIn: 'root',
})
export class PollutionService {
  /**
   * Injection moderne du client HTTP
   */
  private readonly http = inject(HttpClient);

  /**
   * URL de base configurée dynamiquement via environment.ts / environment.development.ts
   */
  readonly apiUrl = `${environment.apiUrl}/pollutions`;

  // ==========================================
  // ÉTATS RÉACTIFS (ANGULAR SIGNALS)
  // ==========================================
  readonly pollutions = signal<Pollution[]>([]);
  readonly selectedPollution = signal<Pollution | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Critères de filtrage actifs
   */
  readonly filterCriteria = signal<PollutionFilterCriteria>({
    searchTerm: '',
    type: 'all',
    sortBy: 'dateDesc',
  });

  /**
   * Signal calculé (computed) : liste filtrée et triée des pollutions en temps réel
   */
  readonly filteredPollutions = computed(() => {
    const list = this.pollutions();
    const { searchTerm, type, sortBy } = this.filterCriteria();
    const term = searchTerm.trim().toLowerCase();

    // 1. Filtrage
    const filtered = list.filter((p) => {
      const matchType = type === 'all' || p.type === type;
      const matchSearch =
        !term ||
        p.titre.toLowerCase().includes(term) ||
        p.lieu.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);

      return matchType && matchSearch;
    });

    // 2. Tri
    return filtered.sort((a, b) => {
      if (sortBy === 'dateDesc') {
        return new Date(b.dateObservation).getTime() - new Date(a.dateObservation).getTime();
      }
      if (sortBy === 'dateAsc') {
        return new Date(a.dateObservation).getTime() - new Date(b.dateObservation).getTime();
      }
      if (sortBy === 'titreAsc') {
        return a.titre.localeCompare(b.titre);
      }
      if (sortBy === 'titreDesc') {
        return b.titre.localeCompare(a.titre);
      }
      return 0;
    });
  });

  /**
   * Nombre total de pollutions enregistrées
   */
  readonly totalCount = computed(() => this.pollutions().length);

  /**
   * Nombre de pollutions après application des filtres
   */
  readonly filteredCount = computed(() => this.filteredPollutions().length);

  // ==========================================
  // OPÉRATIONS CRUD AVEC HTTPCLIENT (OBSERVABLES)
  // ==========================================

  /**
   * READ ALL : Récupère toutes les pollutions depuis l'API REST (GET /pollutions)
   */
  getPollutions(): Observable<Pollution[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Pollution[]>(this.apiUrl).pipe(
      tap({
        next: (items) => {
          this.isLoading.set(false);
          this.pollutions.set(items);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.error.set(this.formatError(err, 'récupération des pollutions'));
        },
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.formatError(err, 'récupération')))
    );
  }

  /**
   * READ ONE : Récupère le détail d'une pollution par son identifiant (GET /pollutions/:id)
   */
  getPollutionById(id: string): Observable<Pollution> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Pollution>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: (item) => {
          this.isLoading.set(false);
          this.selectedPollution.set(item);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.error.set(this.formatError(err, `consultation de la pollution #${id}`));
        },
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.formatError(err, 'détail')))
    );
  }

  /**
   * CREATE : Ajoute une nouvelle pollution via l'API REST (POST /pollutions)
   */
  createPollution(pollution: Pollution): Observable<Pollution> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<Pollution>(this.apiUrl, pollution).pipe(
      tap({
        next: (created) => {
          this.isLoading.set(false);
          // Mise à jour réactive immédiate du signal
          this.pollutions.update((current) => [created, ...current]);
          this.selectedPollution.set(created);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.error.set(this.formatError(err, "création d'une pollution"));
        },
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.formatError(err, 'création')))
    );
  }

  /**
   * UPDATE : Modifie une pollution existante (PUT /pollutions/:id)
   */
  updatePollution(id: string, pollution: Partial<Pollution>): Observable<Pollution> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<Pollution>(`${this.apiUrl}/${id}`, pollution).pipe(
      tap({
        next: (updated) => {
          this.isLoading.set(false);
          // Remplacement dans la liste réactive
          this.pollutions.update((current) =>
            current.map((item) => (item.id === id ? updated : item))
          );
          if (this.selectedPollution()?.id === id) {
            this.selectedPollution.set(updated);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.error.set(this.formatError(err, `modification de la pollution #${id}`));
        },
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.formatError(err, 'modification')))
    );
  }

  /**
   * DELETE : Supprime une pollution par son identifiant (DELETE /pollutions/:id)
   */
  deletePollution(id: string): Observable<{ success: boolean; message: string; id: string }> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http
      .delete<{ success: boolean; message: string; id: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        tap({
          next: () => {
            this.isLoading.set(false);
            // Suppression dans la liste réactive
            this.pollutions.update((current) => current.filter((p) => p.id !== id));
            if (this.selectedPollution()?.id === id) {
              this.selectedPollution.set(null);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading.set(false);
            this.error.set(this.formatError(err, `suppression de la pollution #${id}`));
          },
        }),
        catchError((err: HttpErrorResponse) => throwError(() => this.formatError(err, 'suppression')))
      );
  }

  // ==========================================
  // GESTION DU FILTRE & SÉLECTION
  // ==========================================

  /**
   * Met à jour les critères de filtre réactifs
   */
  updateFilter(criteria: Partial<PollutionFilterCriteria>): void {
    this.filterCriteria.update((current) => ({
      ...current,
      ...criteria,
    }));
  }

  /**
   * Réinitialise les filtres
   */
  resetFilter(): void {
    this.filterCriteria.set({
      searchTerm: '',
      type: 'all',
      sortBy: 'dateDesc',
    });
  }

  /**
   * Sélectionne une pollution pour la vue détaillée
   */
  setSelectedPollution(pollution: Pollution | null): void {
    this.selectedPollution.set(pollution);
  }

  /**
   * Formate proprement les messages d'erreur HTTP
   */
  private formatError(err: HttpErrorResponse, action: string): string {
    if (err.error && typeof err.error === 'object' && 'message' in err.error) {
      return `[Erreur HTTP ${err.status}] ${err.error.message}`;
    }
    return `[Erreur HTTP ${err.status || 0}] Échec lors de la ${action}.`;
  }
}
