import { PollutionLevelPipe } from './pollution-level.pipe';

describe('PollutionLevelPipe', () => {
  let pipe: PollutionLevelPipe;

  beforeEach(() => {
    pipe = new PollutionLevelPipe();
  });

  it('devrait instancier la pipe avec succès', () => {
    expect(pipe).toBeTruthy();
  });

  it('devrait retourner "Faible" pour les indices entre 0 et 20', () => {
    expect(pipe.transform(0)).toBe('Faible');
    expect(pipe.transform(10)).toBe('Faible');
    expect(pipe.transform(20)).toBe('Faible');
    expect(pipe.transform('15')).toBe('Faible');
  });

  it('devrait retourner "Modérée" pour les indices entre 21 et 50', () => {
    expect(pipe.transform(21)).toBe('Modérée');
    expect(pipe.transform(35)).toBe('Modérée');
    expect(pipe.transform(50)).toBe('Modérée');
    expect(pipe.transform('42')).toBe('Modérée');
  });

  it('devrait retourner "Élevée" pour les indices entre 51 et 100', () => {
    expect(pipe.transform(51)).toBe('Élevée');
    expect(pipe.transform(75)).toBe('Élevée');
    expect(pipe.transform(100)).toBe('Élevée');
    expect(pipe.transform('85')).toBe('Élevée');
  });

  it('devrait retourner "Dangereuse" pour les indices supérieurs à 100 (101+)', () => {
    expect(pipe.transform(101)).toBe('Dangereuse');
    expect(pipe.transform(150)).toBe('Dangereuse');
    expect(pipe.transform(300)).toBe('Dangereuse');
    expect(pipe.transform('120')).toBe('Dangereuse');
  });

  it('devrait retourner "Non défini" pour les entrées nulles, indéfinies ou non numériques', () => {
    expect(pipe.transform(null)).toBe('Non défini');
    expect(pipe.transform(undefined)).toBe('Non défini');
    expect(pipe.transform('')).toBe('Non défini');
    expect(pipe.transform('invalide')).toBe('Non défini');
  });
});
