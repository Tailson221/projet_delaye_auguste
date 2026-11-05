import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Pollution } from '../../models/pollution.model';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.css',
})
export class PollutionRecapComponent {
  /**
   * Données de la pollution reçues du composant parent via @Input()
   */
  @Input({ required: true }) pollution!: Pollution;

  /**
   * Événements émis vers le composant parent
   */
  @Output() edit = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  imageError = false;

  get badgeClass(): string {
    switch (this.pollution?.type) {
      case 'Plastique':
        return 'badge-plastique';
      case 'Chimique':
        return 'badge-chimique';
      case 'Dépôt sauvage':
        return 'badge-depot';
      case 'Eau':
        return 'badge-eau';
      case 'Air':
        return 'badge-air';
      default:
        return 'badge-autre';
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  onEdit(): void {
    this.edit.emit();
  }

  onReset(): void {
    this.reset.emit();
  }

  get googleMapsUrl(): string {
    if (!this.pollution) return '#';
    return `https://www.google.com/maps?q=${this.pollution.latitude},${this.pollution.longitude}`;
  }
}
