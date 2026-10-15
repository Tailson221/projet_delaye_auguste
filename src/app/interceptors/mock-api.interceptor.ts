import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiErrorResponse, UserSignupRequest, UserSignupResponse } from '../models/auth.model';
import { HttpTrafficService } from '../services/http-traffic.service';

/**
 * Base de données en mémoire pour le Mock API
 */
const mockUsersDatabase: UserSignupResponse[] = [
  {
    id: 'usr_init_01',
    login: 'claire.sentinelle',
    nom: 'Martin',
    prenom: 'Claire',
    email: 'claire.martin@ecowatch.org',
    role: 'Sentinelle de Terrain',
    token: 'jwt.mock.eyJzdWIiOiJ1c3JfaW5pdF8wMSIsImFsZyI6IkhTMjU2In0.abc12345',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    message: 'Compte actif',
  },
  {
    id: 'usr_init_02',
    login: 'alex.analyste',
    nom: 'Dupont',
    prenom: 'Alexandre',
    email: 'alex.dupont@ecowatch.org',
    role: 'Analyste Environnemental',
    token: 'jwt.mock.eyJzdWIiOiJ1c3JfaW5pdF8wMiIsImFsZyI6IkhTMjU2In0.def67890',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    message: 'Compte actif',
  },
];

/**
 * Intercepteur HTTP fonctionnel Angular simulant l'API REST distante.
 * Permet de tester HttpClient de bout en bout sans avoir besoin d'un serveur backend externe.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const trafficService = inject(HttpTrafficService);
  const startTime = performance.now();
  const delayMs = environment.mockDelayMs || 600;

  // Si la requête ne concerne pas l'URL d'API de l'environnement, on passe au suivant
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const endpoint = req.url.substring(environment.apiUrl.length);

  // 1. ROUTE : POST /auth/signup (Inscription d'un utilisateur)
  if (endpoint === '/auth/signup' && req.method === 'POST') {
    const body = req.body as UserSignupRequest;
    const simulateHeader = req.headers.get('X-Simulate-Error');

    // Cas 1 : Simulation forcée d'une erreur serveur 500
    if (simulateHeader === '500') {
      const errResponse: ApiErrorResponse = {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erreur critique du serveur de base de données (simulation). Veuillez réessayer plus tard.',
        timestamp: new Date().toISOString(),
      };

      return timer(delayMs).pipe(
        switchMap(() => {
          const duration = Math.round(performance.now() - startTime);
          trafficService.log({
            method: 'POST',
            url: req.url,
            statusCode: 500,
            statusText: 'Internal Server Error',
            durationMs: duration,
            requestBody: body,
            responseBody: errResponse,
            isError: true,
          });

          return throwError(
            () =>
              new HttpErrorResponse({
                status: 500,
                statusText: 'Internal Server Error',
                error: errResponse,
                url: req.url,
              })
          );
        })
      );
    }

    // Cas 2 : Simulation de conflit 409 (Email ou login déjà utilisé)
    const emailConflict = mockUsersDatabase.some(
      (u) => u.email.toLowerCase() === body.email?.toLowerCase()
    );
    const loginConflict = mockUsersDatabase.some(
      (u) => u.login.toLowerCase() === body.login?.toLowerCase()
    );

    if (simulateHeader === '409' || emailConflict || loginConflict) {
      const conflictField = emailConflict ? `L'adresse email (${body.email})` : `Le login (${body.login})`;
      const errResponse: ApiErrorResponse = {
        statusCode: 409,
        error: 'Conflict',
        message: `${conflictField} est déjà utilisé par un compte existant.`,
        timestamp: new Date().toISOString(),
      };

      return timer(delayMs).pipe(
        switchMap(() => {
          const duration = Math.round(performance.now() - startTime);
          trafficService.log({
            method: 'POST',
            url: req.url,
            statusCode: 409,
            statusText: 'Conflict',
            durationMs: duration,
            requestBody: body,
            responseBody: errResponse,
            isError: true,
          });

          return throwError(
            () =>
              new HttpErrorResponse({
                status: 409,
                statusText: 'Conflict',
                error: errResponse,
                url: req.url,
              })
          );
        })
      );
    }

    // Cas 3 : Succès 201 Created
    const newId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const mockToken = `jwt.mock.${btoa(JSON.stringify({ sub: newId, email: body.email }))}.${Date.now()}`;

    const createdUser: UserSignupResponse = {
      id: newId,
      login: body.login,
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      role: body.role || 'Éco-Citoyen',
      token: mockToken,
      createdAt: new Date().toISOString(),
      message: 'Inscription validée avec succès sur l’API REST !',
    };

    // Ajout en base de données mémoire
    mockUsersDatabase.unshift(createdUser);

    return of(
      new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: createdUser,
      })
    ).pipe(
      delay(delayMs),
      tap((response) => {
        const duration = Math.round(performance.now() - startTime);
        trafficService.log({
          method: 'POST',
          url: req.url,
          statusCode: 201,
          statusText: 'Created',
          durationMs: duration,
          requestBody: body,
          responseBody: response.body,
          isError: false,
        });
      })
    );
  }

  // 2. ROUTE : GET /users (Liste des utilisateurs enregistrés)
  if (endpoint === '/users' && req.method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: [...mockUsersDatabase],
      })
    ).pipe(
      delay(delayMs * 0.7),
      tap((response) => {
        const duration = Math.round(performance.now() - startTime);
        trafficService.log({
          method: 'GET',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: duration,
          responseBody: response.body,
          isError: false,
        });
      })
    );
  }

  // Si la route n'est pas reconnue
  return next(req);
};
