/**
 * Modèle de données pour la requête d'inscription (Sign Up)
 */
export type UserRole = 'Éco-Citoyen' | 'Sentinelle de Terrain' | 'Analyste Environnemental';

export interface UserSignupRequest {
  login: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: UserRole;
  newsletter?: boolean;
}

/**
 * Modèle de données pour la réponse renvoyée par l'API REST
 */
export interface UserSignupResponse {
  id: string;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  token: string;
  createdAt: string;
  message: string;
}

/**
 * Modèle pour les erreurs d'API HTTP
 */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Entrée de journal pour l'inspecteur HTTP Mock (Traffic Monitor)
 */
export interface HttpTrafficLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number;
  statusText: string;
  durationMs: number;
  requestBody?: unknown;
  responseBody?: unknown;
  isError: boolean;
}
