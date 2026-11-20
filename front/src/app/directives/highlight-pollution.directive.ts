import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

/**
 * Directive personnalisée appliquant une couleur de fond en fonction du niveau de pollution :
 * - Faible (0-20)     → Vert clair (#d1fae5)
 * - Modérée (21-50)   → Jaune (#fef08a)
 * - Élevée (51-100)   → Orange (#fed7aa)
 * - Dangereuse (101+) → Rouge (#fecaca)
 *
 * Accepte en entrée soit un indice numérique (ex: 85), soit un statut textuel (ex: 'Élevée').
 */
@Directive({
  selector: '[appHighlightPollution], [highlightPollution]',
  standalone: true,
})
export class HighlightPollutionDirective implements OnChanges {
  @Input('appHighlightPollution') levelOrValue?: number | string | null;
  @Input('highlightPollution') aliasLevelOrValue?: number | string | null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateBackground();
  }

  private updateBackground(): void {
    const raw = this.levelOrValue ?? this.aliasLevelOrValue;

    if (raw === null || raw === undefined || raw === '') {
      this.clearStyles();
      return;
    }

    const level = this.resolveLevel(raw);

    switch (level) {
      case 'Faible':
        this.applyStyle('#d1fae5', '#065f46', '#a7f3d0'); // Vert clair
        break;
      case 'Modérée':
        this.applyStyle('#fef08a', '#854d0e', '#fde047'); // Jaune
        break;
      case 'Élevée':
        this.applyStyle('#fed7aa', '#9a3412', '#fb923c'); // Orange
        break;
      case 'Dangereuse':
        this.applyStyle('#fecaca', '#991b1b', '#f87171'); // Rouge
        break;
      default:
        this.clearStyles();
        break;
    }
  }

  private resolveLevel(input: number | string): 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse' | 'Inconnu' {
    if (typeof input === 'number') {
      return this.numericToLevel(input);
    }

    const trimmed = input.trim();
    const asNumber = Number(trimmed);

    if (!isNaN(asNumber)) {
      return this.numericToLevel(asNumber);
    }

    const lower = trimmed.toLowerCase();
    if (lower === 'faible') return 'Faible';
    if (lower === 'moderee' || lower === 'modérée') return 'Modérée';
    if (lower === 'elevee' || lower === 'élevée') return 'Élevée';
    if (lower === 'dangereuse') return 'Dangereuse';

    return 'Inconnu';
  }

  private numericToLevel(val: number): 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse' {
    if (val <= 20) return 'Faible';
    if (val <= 50) return 'Modérée';
    if (val <= 100) return 'Élevée';
    return 'Dangereuse';
  }

  private applyStyle(bgColor: string, textColor: string, borderColor: string): void {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', bgColor);
    this.renderer.setStyle(this.el.nativeElement, 'color', textColor);
    this.renderer.setStyle(this.el.nativeElement, 'borderColor', borderColor);
  }

  private clearStyles(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
    this.renderer.removeStyle(this.el.nativeElement, 'color');
    this.renderer.removeStyle(this.el.nativeElement, 'borderColor');
  }
}
