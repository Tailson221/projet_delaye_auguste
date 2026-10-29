import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Pollution, PollutionType } from '../../models/pollution.model';

/**
 * Validateur d'URL optionnelle (valide si vide ou si URL correcte)
 */
function optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value || control.value.trim() === '') {
    return null;
  }
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?$/i;
  return urlPattern.test(control.value.trim()) ? null : { invalidUrl: true };
}

/**
 * Validateur de date (vérifie qu'il s'agit d'une date valide et non future)
 */
function validDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // required s'occupe de la présence
  }
  const dateVal = new Date(control.value);
  if (isNaN(dateVal.getTime())) {
    return { invalidDate: true };
  }
  const now = new Date();
  // Autoriser jusqu'à aujourd'hui inclus (avec une marge de fin de journée)
  now.setHours(23, 59, 59, 999);
  if (dateVal > now) {
    return { futureDate: true };
  }
  return null;
}

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.css',
})
export class PollutionFormComponent implements OnInit, OnChanges {
  /**
   * Données initiales éventuelles (ex: modification)
   */
  @Input() initialData: Pollution | null = null;

  /**
   * Afficher le bouton d'annulation
   */
  @Input() showCancel = false;

  /**
   * Titre personnalisé du bouton de soumission
   */
  @Input() submitLabel = 'Déclarer';

  /**
   * Événement émis lors de la soumission réussie du formulaire
   */
  @Output() formSubmit = new EventEmitter<Pollution>();

  /**
   * Événement émis lors de l'annulation
   */
  @Output() cancel = new EventEmitter<void>();

  pollutionForm!: FormGroup;
  isSubmittedAttempt = false;
  errorMessage = '';

  readonly pollutionTypes: PollutionType[] = [
    'Plastique',
    'Chimique',
    'Dépôt sauvage',
    'Eau',
    'Air',
    'Autre',
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.pollutionForm) {
      if (this.initialData) {
        this.pollutionForm.patchValue({
          titre: this.initialData.titre,
          type: this.initialData.type,
          description: this.initialData.description,
          dateObservation: this.initialData.dateObservation,
          lieu: this.initialData.lieu,
          latitude: this.initialData.latitude,
          longitude: this.initialData.longitude,
          photoUrl: this.initialData.photoUrl || '',
        });
      } else {
        this.reset();
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }


  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.pollutionForm = this.fb.group({
      titre: [
        this.initialData?.titre || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      ],
      type: [
        this.initialData?.type || '',
        [Validators.required],
      ],
      description: [
        this.initialData?.description || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(1000)],
      ],
      dateObservation: [
        this.initialData?.dateObservation || today,
        [Validators.required, validDateValidator],
      ],
      lieu: [
        this.initialData?.lieu || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
      ],
      latitude: [
        this.initialData?.latitude ?? '',
        [
          Validators.required,
          Validators.min(-90),
          Validators.max(90),
          Validators.pattern(/^-?\d+(\.\d+)?$/),
        ],
      ],
      longitude: [
        this.initialData?.longitude ?? '',
        [
          Validators.required,
          Validators.min(-180),
          Validators.max(180),
          Validators.pattern(/^-?\d+(\.\d+)?$/),
        ],
      ],
      photoUrl: [
        this.initialData?.photoUrl || '',
        [optionalUrlValidator],
      ],
    });
  }

  // Getters pratiques pour les contrôles du formulaire
  get f() {
    return this.pollutionForm.controls;
  }

  // Vérifier si un champ est invalide et touché / soumis
  isInvalid(controlName: string): boolean {
    const control = this.pollutionForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.isSubmittedAttempt));
  }

  // Vérifier si un champ est valide et touché
  isValid(controlName: string): boolean {
    const control = this.pollutionForm.get(controlName);
    return !!(control && control.valid && control.touched);
  }

  // Remplissage rapide d'un exemple pour faciliter la correction ou le test
  fillSampleData(): void {
    this.pollutionForm.setValue({
      titre: 'Dépôt sauvage de pneus et bidons',
      type: 'Dépôt sauvage',
      description: 'Environ 20 pneus usagés et plusieurs bidons industriels abandonnés en lisière de forêt près du chemin forestier.',
      dateObservation: new Date().toISOString().split('T')[0],
      lieu: 'Forêt de Fontainebleau, Parcelle 42',
      latitude: 48.4047,
      longitude: 2.7016,
      photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1000&q=80',
    });
  }

  // Soumission du formulaire
  onSubmit(): void {
    this.isSubmittedAttempt = true;
    this.errorMessage = '';

    if (this.pollutionForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire avant de valider.';
      // Marquer tous les champs comme touchés pour afficher les messages d'erreur
      this.pollutionForm.markAllAsTouched();
      return;
    }

    const formValue = this.pollutionForm.value;
    const pollutionData: Pollution = {
      titre: formValue.titre.trim(),
      type: formValue.type,
      description: formValue.description.trim(),
      dateObservation: formValue.dateObservation,
      lieu: formValue.lieu.trim(),
      latitude: parseFloat(formValue.latitude),
      longitude: parseFloat(formValue.longitude),
      photoUrl: formValue.photoUrl ? formValue.photoUrl.trim() : undefined,
      createdAt: new Date(),
    };

    this.formSubmit.emit(pollutionData);
  }

  // Réinitialisation du formulaire
  reset(): void {
    this.pollutionForm.reset({
      titre: '',
      type: '',
      description: '',
      dateObservation: new Date().toISOString().split('T')[0],
      lieu: '',
      latitude: '',
      longitude: '',
      photoUrl: '',
    });
    this.isSubmittedAttempt = false;
    this.errorMessage = '';
  }
}
