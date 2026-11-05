import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { User, UserSignupRequest, UserSignupResponse, UserLoginRequest, UserLoginResponse } from '../models/user.model';
import { HttpTrafficService } from '../services/http-traffic.service';

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
 * Base de données en mémoire pour le Mock API - Utilisateurs
 */
const mockUsersDatabase: (User & { password?: string })[] = [
  {
    id: 1,
    login: 'adelaye',
    nom: 'Delaye',
    prenom: 'Auguste',
    email: 'auguste.delaye@ecowatch.fr',
    role: 'Analyste Environnemental',
    password: 'Password123!',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 2,
    login: 'claire_d',
    nom: 'Dupont',
    prenom: 'Claire',
    email: 'claire.dupont@ecowatch.fr',
    role: 'Éco-Citoyen',
    password: 'Password123!',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    login: 'thomas_m',
    nom: 'Martin',
    prenom: 'Thomas',
    email: 'thomas.martin@ecowatch.fr',
    role: 'Sentinelle de Terrain',
    password: 'Password123!',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

/**
 * Intercepteur HTTP fonctionnel Angular simulant l'API REST distante pour les Pollutions et Utilisateurs.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const trafficService = inject(HttpTrafficService);

  // Si le mode Mock est désactivé, la requête part directement vers le vrai serveur Node.js / PostgreSQL
  if (!trafficService.isMockActive()) {
    return next(req);
  }

  // Si la requête ne concerne pas l'URL d'API de l'environnement, on passe au suivant
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const startTime = performance.now();
  const delayMs = environment.mockDelayMs || 300;
  const endpoint = req.url.substring(environment.apiUrl.length);

  // ==========================================
  // ROUTES POLLUTIONS
  // ==========================================

  // 1. GET /pollutions (Liste de toutes les pollutions)
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

  // 2. GET /pollutions/:id (Détail d'une pollution par son ID)
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

  // 3. POST /pollutions (Création d'une nouvelle pollution)
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

  // 4. PUT /pollutions/:id (Mise à jour d'une pollution)
  const putMatch = endpoint.match(/^\/pollutions\/([a-zA-Z0-9_-]+)$/);
  if (putMatch && req.method === 'PUT') {
    const polId = putMatch[1];
    const updatePayload = req.body as Partial<Pollution>;
    const idx = mockPollutionsDatabase.findIndex((p) => p.id === polId);

    if (idx === -1) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 404, error: 'Not Found', message: `Impossible de modifier : pollution #${polId} introuvable` };
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

  // 5. DELETE /pollutions/:id (Suppression d'une pollution)
  const deletePolMatch = endpoint.match(/^\/pollutions\/([a-zA-Z0-9_-]+)$/);
  if (deletePolMatch && req.method === 'DELETE') {
    const polId = deletePolMatch[1];
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

    mockPollutionsDatabase.splice(idx, 1);

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
  // ROUTES USERS (TP 04)
  // ==========================================

  // 6. GET /users (Liste de tous les utilisateurs)
  if (endpoint === '/users' && req.method === 'GET') {
    const safeUsers = mockUsersDatabase.map(({ password, ...u }) => u);
    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: safeUsers,
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

  // 7. GET /users/:id (Détails d'un utilisateur par ID)
  const getUserByIdMatch = endpoint.match(/^\/users\/([0-9]+)$/);
  if (getUserByIdMatch && req.method === 'GET') {
    const userId = Number(getUserByIdMatch[1]);
    const user = mockUsersDatabase.find((u) => u.id === userId);

    if (!user) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 404, error: 'Not Found', message: `Utilisateur introuvable avec l'ID ${userId}` };
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

    const { password, ...safeUser } = user;
    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: safeUser,
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

  // 8. POST /users (Création d'un utilisateur)
  if (endpoint === '/users' && req.method === 'POST') {
    const payload = req.body as UserSignupRequest;
    const existing = mockUsersDatabase.find((u) => u.login === payload.login);

    if (existing) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 409, message: `L'identifiant '${payload.login}' est déjà utilisé par un autre compte.` };
          trafficService.log({
            method: 'POST',
            url: req.url,
            statusCode: 409,
            statusText: 'Conflict',
            durationMs: Math.round(performance.now() - startTime),
            requestBody: payload,
            responseBody: errRes,
            isError: true,
          });
          return throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict', error: errRes, url: req.url }));
        })
      );
    }

    const newId = mockUsersDatabase.length > 0 ? Math.max(...mockUsersDatabase.map((u) => Number(u.id))) + 1 : 1;
    const createdUser: UserSignupResponse = {
      id: newId,
      login: payload.login,
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email,
      role: payload.role,
      token: `fake-jwt-token-${newId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      message: 'Utilisateur créé avec succès.',
    };

    mockUsersDatabase.push({
      ...createdUser,
      password: payload.password,
    });

    return of(
      new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: createdUser,
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

  // 9. POST /users/login (Authentification fictive)
  if (endpoint === '/users/login' && req.method === 'POST') {
    const payload = req.body as UserLoginRequest;
    const user = mockUsersDatabase.find(
      (u) => (payload.login && u.login === payload.login) || (payload.email && u.email === payload.email)
    );

    if (!user || user.password !== payload.password) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 401, message: 'Identifiant ou mot de passe incorrect.' };
          trafficService.log({
            method: 'POST',
            url: req.url,
            statusCode: 401,
            statusText: 'Unauthorized',
            durationMs: Math.round(performance.now() - startTime),
            requestBody: payload,
            responseBody: errRes,
            isError: true,
          });
          return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: errRes, url: req.url }));
        })
      );
    }

    const loginRes: UserLoginResponse = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      token: `fake-jwt-token-${user.id}-${Date.now()}`,
      message: 'Authentification réussie.',
    };

    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: loginRes,
      })
    ).pipe(
      delay(delayMs),
      tap((res) => {
        trafficService.log({
          method: 'POST',
          url: req.url,
          statusCode: 200,
          statusText: 'OK',
          durationMs: Math.round(performance.now() - startTime),
          requestBody: payload,
          responseBody: res.body,
          isError: false,
        });
      })
    );
  }

  // 10. DELETE /users/:id (Suppression d'un utilisateur)
  const deleteUserMatch = endpoint.match(/^\/users\/([0-9]+)$/);
  if (deleteUserMatch && req.method === 'DELETE') {
    const userId = Number(deleteUserMatch[1]);
    const idx = mockUsersDatabase.findIndex((u) => u.id === userId);

    if (idx === -1) {
      return timer(delayMs).pipe(
        switchMap(() => {
          const errRes = { statusCode: 404, message: `Impossible de supprimer : utilisateur #${userId} introuvable` };
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

    mockUsersDatabase.splice(idx, 1);

    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: { message: `Utilisateur #${userId} supprimé avec succès.` },
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

  return next(req);
};
