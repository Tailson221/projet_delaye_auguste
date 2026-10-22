import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { environment } from '../../../environments/environment';
import { UserRole, UserSignupRequest } from '../../models/auth.model';
import { AuthService, SimulationScenario } from '../../services/auth.service';
import { HttpTrafficService } from '../../services/http-traffic.service';

/**
 * Validateur personnalisé vérifiant la concordance entre mot de passe et confirmation
 */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!password || !confirmPassword) {
    return null;
  }
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup-api',
  imports: [ReactiveFormsModule, DatePipe, JsonPipe],
  templateUrl: './signup-api.html',
  styleUrl: './signup-api.css',
})
export class SignupApiComponent implements OnInit {
  // ==========================================
  // INJECTION DE DÉPENDANCES MODERNE AVEC inject()
  // ==========================================
  readonly authService = inject(AuthService);
  readonly trafficService = inject(HttpTrafficService);
  private readonly fb = inject(FormBuilder);

  // Variables d'environnement exposées au template
  readonly isProduction = environment.production;
  readonly apiUrl = environment.apiUrl;

  // Rôles disponibles pour les nouveaux inscrits
  readonly availableRoles: UserRole[] = [
    'Éco-Citoyen',
    'Sentinelle de Terrain',
    'Analyste Environnemental',
  ];

  // ==========================================
  // SIGNAUX POUR L'ÉTAT LOCAL DU COMPOSANT
  // ==========================================
  readonly showPassword = signal<boolean>(false);
  readonly simulationMode = signal<SimulationScenario>('none');
  readonly viewMode = signal<'form' | 'success'>('form');
  readonly activeDetailTab = signal<'traffic' | 'database'>('traffic');
  readonly formSubmittedAttempt = signal<boolean>(false);

  // Signaux réactifs dérivés du service AuthService
  readonly registeredUsers = this.authService.users;
  readonly isLoading = this.authService.isLoading;
  readonly lastRegisteredUser = this.authService.lastRegisteredUser;
  readonly lastError = this.authService.lastError;
  readonly totalUsersCount = this.authService.totalUsersCount;

  // Signal calculé vérifiant si le mot de passe est divergent
  readonly isMismatch = computed(() => {
    return (
      this.signupForm.hasError('passwordMismatch') &&
      (this.signupForm.get('confirmPassword')?.touched || this.formSubmittedAttempt())
    );
  });

  // ==========================================
  // FORMULAIRE RÉACTIF TYPÉ
  // ==========================================
  readonly signupForm: FormGroup = this.fb.group(
    {
      login: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/),
        ],
      ],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['Éco-Citoyen' as UserRole, [Validators.required]],
      newsletter: [true],
    },
    { validators: [passwordMatchValidator] }
  );

  ngOnInit(): void {
    // Chargement initial des utilisateurs existants via GET /users
    this.refreshUsers();
  }

  /**
   * Soumission du formulaire d'inscription
   */
  onSubmit(): void {
    this.formSubmittedAttempt.set(true);

    if (this.signupForm.invalid) {
      return;
    }

    const val = this.signupForm.value;
    const payload: UserSignupRequest = {
      login: val.login.trim(),
      nom: val.nom.trim(),
      prenom: val.prenom.trim(),
      email: val.email.trim(),
      password: val.password,
      role: val.role,
      newsletter: !!val.newsletter,
    };

    // Appel HTTP POST via le service injecté
    this.authService.signup(payload, this.simulationMode()).subscribe({
      next: () => {
        this.viewMode.set('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        // L'erreur est automatiquement enregistrée dans le signal lastError d'AuthService
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }

  /**
   * Recharge la liste des utilisateurs depuis l'API REST mockée (requête GET)
   */
  refreshUsers(): void {
    this.authService.fetchUsers().subscribe({
      error: () => {
        // géré via lastError
      },
    });
  }

  /**
   * Affichage / masquage du mot de passe
   */
  togglePassword(): void {
    this.showPassword.update((val) => !val);
  }

  /**
   * Pré-remplit le formulaire avec des données d'exemple pour tester rapidement
   */
  fillExample(type: 'valid' | 'conflict'): void {
    if (type === 'valid') {
      const rand = Math.floor(Math.random() * 900 + 100);
      this.signupForm.patchValue({
        login: `sentinelle.eco${rand}`,
        nom: 'Lemoine',
        prenom: 'Thomas',
        email: `thomas.lemoine${rand}@ecowatch.org`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Sentinelle de Terrain',
        newsletter: true,
      });
      this.simulationMode.set('none');
    } else {
      // Pré-remplit avec l'email déjà existant en base de données mockée pour déclencher HTTP 409
      this.signupForm.patchValue({
        login: 'claire.sentinelle',
        nom: 'Martin',
        prenom: 'Claire',
        email: 'claire.martin@ecowatch.org',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Sentinelle de Terrain',
        newsletter: false,
      });
      this.simulationMode.set('none');
    }
  }

  /**
   * Revenir au formulaire après un succès
   */
  createNewSignup(): void {
    this.signupForm.reset({
      role: 'Éco-Citoyen',
      newsletter: true,
    });
    this.formSubmittedAttempt.set(false);
    this.authService.resetState();
    this.viewMode.set('form');
  }

  /**
   * Effacer l'historique des requêtes
   */
  clearLogs(): void {
    this.trafficService.clearLogs();
  }
}
