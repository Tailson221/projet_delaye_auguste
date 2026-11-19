export type PollutionType = 'Plastique' | 'Chimique' | 'Dépôt sauvage' | 'Eau' | 'Air' | 'Autre';

export interface Pollution {
  id?: string;
  titre: string;
  type: PollutionType | string;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Critères de filtrage et tri pour la liste des pollutions
 */
export interface PollutionFilterCriteria {
  searchTerm: string;
  type: string; // 'all' ou PollutionType
  sortBy: 'dateDesc' | 'dateAsc' | 'titreAsc' | 'titreDesc';
}

/**
 * Entrée de journal pour l'inspecteur HTTP Mock
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
