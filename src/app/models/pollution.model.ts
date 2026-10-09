export type PollutionType = 'Plastique' | 'Chimique' | 'Dépôt sauvage' | 'Eau' | 'Air' | 'Autre';

export interface Pollution {
  titre: string;
  type: PollutionType | string;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  createdAt?: Date;
}
