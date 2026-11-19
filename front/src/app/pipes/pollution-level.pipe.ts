import { Pipe, PipeTransform } from '@angular/core';

export type PollutionDangerStatus = 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse' | 'Non défini';

/**
 * Pipe personnalisée transformant un indice de dangerosité numérique en statut textuel :
 * - 0 à 20   → Faible
 * - 21 à 50  → Modérée
 * - 51 à 100 → Élevée
 * - 101+     → Dangereuse
 */
@Pipe({
  name: 'pollutionLevel',
  standalone: true,
})
export class PollutionLevelPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return 'Non défini';
    }

    const numericValue = typeof value === 'number' ? value : Number(value);

    if (isNaN(numericValue)) {
      return 'Non défini';
    }

    if (numericValue <= 20) {
      return 'Faible';
    } else if (numericValue <= 50) {
      return 'Modérée';
    } else if (numericValue <= 100) {
      return 'Élevée';
    } else {
      return 'Dangereuse';
    }
  }
}
