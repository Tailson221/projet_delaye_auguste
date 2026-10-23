import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiErrorResponse, UserSignupRequest, UserSignupResponse } from '../models/auth.model';
import { Pollution } from '../models/pollution.model';
import { HttpTrafficService } from '../services/http-traffic.service';

/**
 * Base de données en mémoire pour le Mock API - Utilisateurs
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
 * Base de données en mémoire pour le Mock API - Pollutions (CRUD)
 */
const mockPollutionsDatabase: Pollution[] = [
  {
    id: 'pol_1',
    titre: 'Déchets plastiques abondants sur le rivage',
    type: 'Plastique',
    description: 'Accumulation majeure de bouteilles, sacs plastiques et fragments de filets de pêche échoués le long de la plage après la tempête.',
    dateObservation: '2026-03-28',
    lieu: 'Plage des Dunes, Biarritz',
    latitude: 43.4832,
    longitude: -1.5586,
    photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'pol_2',
    titre: 'Déversement suspect d’effluents colorés',
    type: 'Eau',
    description: 'Une canalisation d’évacuation déverse un liquide rougeoyant avec une forte odeur de solvant directement dans la Meurthe.',
    dateObservation: '2026-04-02',
    lieu: 'Berges de la Meurthe, Nancy',
    latitude: 48.6921,
    longitude: 6.1844,
    photoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'pol_3',
    titre: 'Dépôt sauvage de pneus et gravats en sous-bois',
    type: 'Dépôt sauvage',
    description: 'Déversement clandestin estimé à plus de 40 pneus usagés et plusieurs mètres cubes de gravats de chantier en pleine forêt domaniale.',
    dateObservation: '2026-04-10',
    lieu: 'Forêt de Fontainebleau, Parcelle 42',
    latitude: 48.4047,
    longitude: 2.7016,
    photoUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'pol_4',
    titre: 'Émanations âcres et fumée noire persistante',
    type: 'Air',
    description: 'Brûlage sauvage de résidus plastiques et câbles électriques en soirée causant un nuage de fumée irritant pour les riverains.',
    dateObservation: '2026-04-14',
    lieu: 'Zone Industrielle Nord, Le Havre',
    latitude: 49.4944,
    longitude: 0.1079,
    photoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

/**
 * Intercepteur HTTP fonctionnel Angular simulant l'API REST distante pour Auth et Pollutions (CRUD complet).
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const trafficService = inject(HttpTrafficService);
  const startTime = performance.now();
  const delayMs = environment.mockDelayMs || 500;

  // Si la requête ne concerne pas l'URL d'API de l'environnement, on passe au suivant
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const endpoint = req.url.substring(environment.apiUrl.length);

  // ==========================================
  // SECTION 1 : API POLLUTIONS (CRUD COMPLET)
  // ==========================================

  // 1.1 ROUTE : GET /pollutions (Liste de toutes les pollutions)
  if (endpoint === '/pollutions' && req.method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: [...mockPollutionsDatabase],
      })
    ).pipe(
      delay(delayMs),
      tap((res) => {
        trafficService.log({
          method: 'GET',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: Math.round(performance.now() - startTime),
          responseBody: res.body,
          isError: false,
        });
      })
    );
  }

  // 1.2 ROUTE : GET /pollutions/:id (Détail d'une pollution par son ID)
  const getByIdMatch = endpoint.match(/^\/pollutions\/([a-zA-Z0-9_-]+)$/);
  if (getByIdMatch && req.method === 'GET') {
    const polId = getByIdMatch[1];
    const item = mockPollutionsDatabase.find((p) => p.id === polId);

    if (!item) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 404, error: 'Not Found', message: `Pollution introuvable avec l'ID ${polId}` };
          trafficService.log({
            method: 'GET',
            url: req.url,
            statusCode: 404,
            statusText: 'Not Found',
            durationMs: Math.round(performance.now() - startTime),
            responseBody: errRes,
            isError: true,
          });
          return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', error: errRes, url: req.url }));
        })
      );
    }

    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: { ...item },
      })
    ).pipe(
      delay(delayMs * 0.7),
      tap((res) => {
        trafficService.log({
          method: 'GET',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: Math.round(performance.now() - startTime),
          responseBody: res.body,
          isError: false,
        });
      })
    );
  }

  // 1.3 ROUTE : POST /pollutions (Création d'une nouvelle pollution)
  if (endpoint === '/pollutions' && req.method === 'POST') {
    const payload = req.body as Pollution;
    const newId = `pol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdItem: Pollution = {
      ...payload,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPollutionsDatabase.unshift(createdItem);

    return of(
      new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: createdItem,
      })
    ).pipe(
      delay(delayMs),
      tap((res) => {
        trafficService.log({
          method: 'POST',
          url: req.url,
          statusCode: 201,
          statusText: 'Created',
          durationMs: Math.round(performance.now() - startTime),
          requestBody: payload,
          responseBody: res.body,
          isError: false,
        });
      })
    );
  }

  // 1.4 ROUTE : PUT /pollutions/:id (Mise à jour d'une pollution existante)
  const putMatch = endpoint.match(/^\/pollutions\/([a-zA-Z0-9_-]+)$/);
  if (putMatch && req.method === 'PUT') {
    const polId = putMatch[1];
    const updatePayload = req.body as Partial<Pollution>;
    const idx = mockPollutionsDatabase.findIndex((p) => p.id === polId);

    if (idx === -1) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 404, error: 'Not Found', message: `Pollution #${polId} introuvable pour mise à jour` };
          trafficService.log({
            method: 'PUT',
            url: req.url,
            statusCode: 404,
            statusText: 'Not Found',
            durationMs: Math.round(performance.now() - startTime),
            requestBody: updatePayload,
            responseBody: errRes,
            isError: true,
          });
          return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', error: errRes, url: req.url }));
        })
      );
    }

    const updatedItem: Pollution = {
      ...mockPollutionsDatabase[idx],
      ...updatePayload,
      id: polId,
      updatedAt: new Date().toISOString(),
    };
    mockPollutionsDatabase[idx] = updatedItem;

    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: updatedItem,
      })
    ).pipe(
      delay(delayMs),
      tap((res) => {
        trafficService.log({
          method: 'PUT',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: Math.round(performance.now() - startTime),
          requestBody: updatePayload,
          responseBody: res.body,
          isError: false,
        });
      })
    );
  }

  // 1.5 ROUTE : DELETE /pollutions/:id (Suppression d'une pollution)
  const deleteMatch = endpoint.match(/^\/pollutions\/([a-zA-Z0-9_-]+)$/);
  if (deleteMatch && req.method === 'DELETE') {
    const polId = deleteMatch[1];
    const idx = mockPollutionsDatabase.findIndex((p) => p.id === polId);

    if (idx === -1) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 404, error: 'Not Found', message: `Impossible de supprimer : pollution #${polId} introuvable` };
          trafficService.log({
            method: 'DELETE',
            url: req.url,
            statusCode: 404,
            statusText: 'Not Found',
            durationMs: Math.round(performance.now() - startTime),
            responseBody: errRes,
            isError: true,
          });
          return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', error: errRes, url: req.url }));
        })
      );
    }

    const deleted = mockPollutionsDatabase.splice(idx, 1)[0];

    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: { success: true, message: `Pollution #${polId} supprimée avec succès`, id: polId },
      })
    ).pipe(
      delay(delayMs * 0.8),
      tap((res) => {
        trafficService.log({
          method: 'DELETE',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: Math.round(performance.now() - startTime),
          responseBody: res.body,
          isError: false,
        });
      })
    );
  }

  // ==========================================
  // SECTION 2 : API AUTHENTIFICATION (SIGN UP)
  // ==========================================
  if (endpoint === '/auth/signup' && req.method === 'POST') {
    const body = req.body as UserSignupRequest;
    const simulateHeader = req.headers.get('X-Simulate-Error');

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
        trafficService.log({
          method: 'POST',
          url: req.url,
          statusCode: 201,
          statusText: 'Created',
          durationMs: Math.round(performance.now() - startTime),
          requestBody: body,
          responseBody: response.body,
          isError: false,
        });
      })
    );
  }

  // ROUTE : GET /users
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
        trafficService.log({
          method: 'GET',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: Math.round(performance.now() - startTime),
          responseBody: response.body,
          isError: false,
        });
      })
    );
  }

  return next(req);
};
