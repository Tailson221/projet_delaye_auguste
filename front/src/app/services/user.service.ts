import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  User,
  UserLoginRequest,
  UserLoginResponse,
  UserSignupRequest,
  UserSignupResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * Injection moderne de HttpClient via inject()
   */
  private readonly http = inject(HttpClient);

  /**
   * URL de l'API configurée dynamiquement
   */
  readonly apiUrl = `${environment.apiUrl}/users`;

  // ==========================================
  // ÉTATS RÉACTIFS (ANGULAR SIGNALS)
  // ==========================================
  readonly users = signal<User[]>([]);
  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly lastActionMessage = signal<string | null>(null);

  /**
   * Signal calculé : nombre total d'utilisateurs
   */
  readonly totalUsersCount = computed(() => this.users().length);

  /**
   * Signal calculé : indique si un utilisateur est actuellement authentifié
   */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /**
   * Récupère la liste complète des utilisateurs via GET /api/users
   */
  getUsers(): Observable<User[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<User[]>(this.apiUrl).pipe(
      tap((data) => {
        this.users.set(data);
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const errMsg = this.extractErrorMessage(err);
        this.error.set(errMsg);
        return throwError(() => new Error(errMsg));
      })
    );
  }

  /**
   * Récupère un utilisateur spécifique par son identifiant via GET /api/users/:id
   */
  getUserById(id: number | string): Observable<User> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const errMsg = this.extractErrorMessage(err);
        this.error.set(errMsg);
        return throwError(() => new Error(errMsg));
      })
    );
  }

  /**
   * Crée un nouvel utilisateur (inscription) via POST /api/users
   */
  createUser(payload: UserSignupRequest): Observable<UserSignupResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<UserSignupResponse>(this.apiUrl, payload).pipe(
      tap((newUser) => {
        this.isLoading.set(false);
        this.lastActionMessage.set(`Utilisateur "${newUser.prenom} ${newUser.nom}" créé avec succès.`);
        // Mise à jour réactive de la liste locale
        this.users.update((current) => [...current, newUser]);
        // Définir comme utilisateur actif
        this.currentUser.set(newUser);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const errMsg = this.extractErrorMessage(err);
        this.error.set(errMsg);
        return throwError(() => new Error(errMsg));
      })
    );
  }

  /**
   * Connexion fictive d'un utilisateur via POST /api/users/login
   */
  login(credentials: UserLoginRequest): Observable<UserLoginResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<UserLoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.currentUser.set(res);
        this.lastActionMessage.set(`Connexion réussie en tant que ${res.prenom} ${res.nom}.`);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const errMsg = this.extractErrorMessage(err);
        this.error.set(errMsg);
        return throwError(() => new Error(errMsg));
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur actif
   */
  logout(): void {
    this.currentUser.set(null);
    this.lastActionMessage.set('Session fermée.');
  }

  /**
   * Supprime un utilisateur via DELETE /api/users/:id
   */
  deleteUser(id: number | string): Observable<{ message: string }> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.lastActionMessage.set(res.message || `Utilisateur #${id} supprimé.`);
        // Retirer de la liste réactive locale
        this.users.update((current) => current.filter((u) => u.id !== id));
        // Si l'utilisateur connecté est celui supprimé, déconnexion
        if (this.currentUser()?.id === id) {
          this.currentUser.set(null);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const errMsg = this.extractErrorMessage(err);
        this.error.set(errMsg);
        return throwError(() => new Error(errMsg));
      })
    );
  }

  /**
   * Formate les erreurs HTTP de façon lisible pour l'IHM
   */
  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.error && typeof err.error === 'object' && err.error.message) {
      return err.error.message;
    }
    if (err.status === 0) {
      return "Impossible de joindre le serveur API. Vérifiez votre connexion ou l'état de Render.";
    }
    if (err.status === 409) {
      return "Cet identifiant ou email est déjà enregistré.";
    }
    if (err.status === 401) {
      return "Identifiant ou mot de passe incorrect.";
    }
    return `Erreur HTTP ${err.status}: ${err.statusText || 'Erreur inattendue'}`;
  }
}

