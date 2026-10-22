import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Pollution, PollutionFilterCriteria, PollutionType } from '../../models/pollution.model';
import { PollutionService } from '../../services/pollution.service';
import { PollutionFormComponent } from '../pollution-form/pollution-form';

export type CrudViewMode = 'list' | 'detail' | 'create' | 'edit';

@Component({
  selector: 'app-pollution-crud',
  imports: [FormsModule, DatePipe, PollutionFormComponent],
  templateUrl: './pollution-crud.html',
  styleUrl: './pollution-crud.css',
})
export class PollutionCrudComponent implements OnInit {
  // ==========================================
  // INJECTION DE DÉPENDANCE VIA inject()
  // ==========================================
  readonly pollutionService = inject(PollutionService);

  // Informations d'environnement
  readonly isProduction = environment.production;
  readonly apiUrl = this.pollutionService.apiUrl;

  // Types de pollution disponibles
  readonly pollutionTypes: ('all' | PollutionType)[] = [
    'all',
    'Plastique',
    'Chimique',
    'Dépôt sauvage',
    'Eau',
    'Air',
    'Autre',
  ];

  // ==========================================
  // ÉTATS RÉACTIFS LOCAUX (SIGNALS)
  // ==========================================
  readonly viewMode = signal<CrudViewMode>('list');
  readonly editingPollution = signal<Pollution | null>(null);
  readonly deleteConfirmId = signal<string | null>(null);
  readonly toastMessage = signal<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Signaux dérivés du PollutionService
  readonly pollutions = this.pollutionService.pollutions;
  readonly filteredPollutions = this.pollutionService.filteredPollutions;
  readonly selectedPollution = this.pollutionService.selectedPollution;
  readonly isLoading = this.pollutionService.isLoading;
  readonly error = this.pollutionService.error;
  readonly totalCount = this.pollutionService.totalCount;
  readonly filteredCount = this.pollutionService.filteredCount;
  readonly filterCriteria = this.pollutionService.filterCriteria;

  ngOnInit(): void {
    // Chargement initial des pollutions depuis le backend mocké
    this.loadPollutions();
  }

  /**
   * READ ALL : Charge ou rafraîchit la liste des pollutions
   */
  loadPollutions(): void {
    this.pollutionService.getPollutions().subscribe({
      error: (err) => console.error('Erreur chargement pollutions :', err),
    });
  }

  /**
   * READ ONE : Affiche la fiche détaillée d'une pollution
   */
  viewDetail(id: string): void {
    this.pollutionService.getPollutionById(id).subscribe({
      next: () => {
        this.viewMode.set('detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => this.showToast('error', `Impossible de charger le détail : ${err}`),
    });
  }

  /**
   * Bascule en mode création
   */
  openCreateForm(): void {
    this.editingPollution.set(null);
    this.viewMode.set('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Bascule en mode édition avec les données pré-remplies
   */
  openEditForm(pollution: Pollution): void {
    this.editingPollution.set(pollution);
    this.viewMode.set('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * CREATE ou UPDATE : Traite la soumission du formulaire
   */
  onFormSubmit(formData: Pollution): void {
    if (this.viewMode() === 'create') {
      // POST /pollutions
      this.pollutionService.createPollution(formData).subscribe({
        next: (created) => {
          this.showToast('success', `Pollution « ${created.titre} » enregistrée avec succès (HTTP 201) !`);
          this.viewMode.set('list');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err) => this.showToast('error', `Échec de l'ajout : ${err}`),
      });
    } else if (this.viewMode() === 'edit' && this.editingPollution()?.id) {
      // PUT /pollutions/:id
      const id = this.editingPollution()!.id!;
      this.pollutionService.updatePollution(id, formData).subscribe({
        next: (updated) => {
          this.showToast('success', `Pollution « ${updated.titre} » mise à jour avec succès (HTTP 200) !`);
          this.viewMode.set('detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err) => this.showToast('error', `Échec de la mise à jour : ${err}`),
      });
    }
  }

  /**
   * Annule le formulaire et revient à la liste ou au détail
   */
  onFormCancel(): void {
    if (this.editingPollution()) {
      this.viewMode.set('detail');
    } else {
      this.viewMode.set('list');
    }
  }

  /**
   * DELETE : Demande de confirmation
   */
  askDelete(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.deleteConfirmId.set(id);
  }

  /**
   * Annulation de suppression
   */
  cancelDelete(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.deleteConfirmId.set(null);
  }

  /**
   * DELETE : Exécution de la suppression
   */
  confirmDelete(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.deleteConfirmId.set(null);

    this.pollutionService.deletePollution(id).subscribe({
      next: () => {
        this.showToast('success', `Pollution #${id} supprimée avec succès (HTTP 200) !`);
        if (this.viewMode() === 'detail') {
          this.viewMode.set('list');
        }
      },
      error: (err) => this.showToast('error', `Échec de la suppression : ${err}`),
    });
  }

  // ==========================================
  // FILTRAGE ET RECHERCHE
  // ==========================================
  onSearchChange(term: string): void {
    this.pollutionService.updateFilter({ searchTerm: term });
  }

  onTypeChange(type: string): void {
    this.pollutionService.updateFilter({ type });
  }

  onSortChange(sortBy: PollutionFilterCriteria['sortBy']): void {
    this.pollutionService.updateFilter({ sortBy });
  }

  resetFilters(): void {
    this.pollutionService.resetFilter();
  }

  /**
   * Retourne à la liste
   */
  backToList(): void {
    this.viewMode.set('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Affiche un message toast temporaire
   */
  private showToast(type: 'success' | 'error' | 'info', text: string): void {
    this.toastMessage.set({ type, text });
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4500);
  }

  /**
   * Calcule la classe CSS du badge en fonction du type de pollution
   */
  getBadgeClass(type: string): string {
    switch (type) {
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

  /**
   * Génère l'URL Google Maps
   */
  getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}
