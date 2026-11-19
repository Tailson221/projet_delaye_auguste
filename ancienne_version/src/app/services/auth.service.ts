import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiErrorResponse, UserSignupRequest, UserSignupResponse } from '../models/auth.model';

export type SimulationScenario = 'none' | 'conflict' | 'server';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Injection moderne de HttpClient via inject() (recommandation officielle Angular)
   */
  private readonly http = inject(HttpClient);

  /**
   * URL de base configurée dynamiquement selon l'environnement actif (environment.ts / environment.development.ts)
   */
  readonly apiUrl = environment.apiUrl;

  // ==========================================
  // ÉTATS RÉACTIFS (ANGULAR SIGNALS)
  // ==========================================
  /**
   * Liste des utilisateurs enregistrés maintenue en mémoire réactive
   */
  readonly users = signal<UserSignupResponse[]>([]);

  /**
   * Indicateur d'appel HTTP en cours
   */
  readonly isLoading = signal<boolean>(false);

  /**
   * Dernier utilisateur inscrit avec succès
   */
  readonly lastRegisteredUser = signal<UserSignupResponse | null>(null);

  /**
   * Dernier message d'erreur HTTP rencontré
   */
  readonly lastError = signal<string | null>(null);

  /**
   * Signal calculé (computed) : nombre total d'utilisateurs inscrits
   */
  readonly totalUsersCount = computed(() => this.users().length);

  /**
   * Envoie une requête POST vers l'API REST pour inscrire un nouvel utilisateur.
   *
   * @param userData Données de l'utilisateur à créer
   * @param simulation Permet de tester les scénarios d'erreur (409 Conflit ou 500 Erreur serveur)
   * @returns Un Observable typé émettant la réponse de l'API (UserSignupResponse)
   */
  signup(
    userData: UserSignupRequest,
    simulation: SimulationScenario = 'none'
  ): Observable<UserSignupResponse> {
    const endpointUrl = `${this.apiUrl}/auth/signup`;

    // Configuration des headers HTTP (notamment pour tester les simulations d'erreur de l'intercepteur)
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    if (simulation === 'server') {
      headers = headers.set('X-Simulate-Error', '500');
    } else if (simulation === 'conflict') {
      headers = headers.set('X-Simulate-Error', '409');
    }

    this.isLoading.set(true);
    this.lastError.set(null);

    return this.http
      .post<UserSignupResponse>(endpointUrl, userData, { headers })
      .pipe(
        tap({
          next: (response) => {
            this.isLoading.set(false);
            this.lastRegisteredUser.set(response);
            // Mise à jour réactive de la liste locale des utilisateurs
            this.users.update((current) => [response, ...current]);
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading.set(false);
            const formattedMsg = this.formatErrorMessage(error);
            this.lastError.set(formattedMsg);
          },
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.formatErrorMessage(error));
        })
      );
  }

  /**
   * Récupère la liste complète des utilisateurs via un appel GET vers l'API REST.
   *
   * @returns Un Observable typé émettant un tableau d'utilisateurs
   */
  fetchUsers(): Observable<UserSignupResponse[]> {
    const endpointUrl = `${this.apiUrl}/users`;

    this.isLoading.set(true);

    return this.http.get<UserSignupResponse[]>(endpointUrl).pipe(
      tap({
        next: (usersList) => {
          this.isLoading.set(false);
          this.users.set(usersList);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.lastError.set(this.formatErrorMessage(error));
        },
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.formatErrorMessage(error));
      })
    );
  }

  /**
   * Réinitialise le dernier utilisateur inscrit et les erreurs
   */
  resetState(): void {
    this.lastRegisteredUser.set(null);
    this.lastError.set(null);
  }

  /**
   * Formate proprement les messages d'erreur HTTP provenant du backend mocké
   */
  private formatErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      const apiErr = error.error as ApiErrorResponse;
      return `[Erreur HTTP ${error.status}] ${apiErr.message}`;
    }

    if (error.status === 0) {
      return 'Impossible de joindre le serveur distant (problème de réseau ou CORS).';
    }

    return `[Erreur HTTP ${error.status}] ${error.statusText || 'Une erreur inattendue est survenue.'}`;
  }
}
