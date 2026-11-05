/**
 * Modèle de données pour les utilisateurs de l'application EcoWatch
 */

export type UserRole = 'Éco-Citoyen' | 'Sentinelle de Terrain' | 'Analyste Environnemental';

export interface User {
  id: number | string;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole | string;
  createdAt?: string;
}

export interface UserSignupRequest {
  login: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: UserRole | string;
}

export interface UserSignupResponse {
  id: number | string;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole | string;
  token?: string;
  createdAt?: string;
  message?: string;
}

export interface UserLoginRequest {
  login?: string;
  email?: string;
  password: string;
}

export interface UserLoginResponse {
  id: number | string;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole | string;
  token?: string;
  message?: string;
}
