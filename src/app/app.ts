import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PollutionFormComponent } from './components/pollution-form/pollution-form';
import { PollutionRecapComponent } from './components/pollution-recap/pollution-recap';
import { SignupApiComponent } from './components/signup-api/signup-api';
import { Pollution } from './models/pollution.model';

export interface UserSignup {
  login: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PollutionFormComponent,
    PollutionRecapComponent,
    SignupApiComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Onglet actif : 'tp3-api' (par défaut pour la Séance 3), 'tp2-pollution' ou 'tp1-signup'
  activeTab: 'tp3-api' | 'tp2-pollution' | 'tp1-signup' = 'tp3-api';

  // ==========================================
  // ÉTAT TP 02 : DÉCLARATION POLLUTION (REACTIVE FORMS)
  // ==========================================
  isPollutionSubmitted = false;
  currentPollution: Pollution | null = null;

  onPollutionSubmitted(pollutionData: Pollution): void {
    this.currentPollution = pollutionData;
    this.isPollutionSubmitted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onEditPollution(): void {
    this.isPollutionSubmitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onResetPollution(): void {
    this.currentPollution = null;
    this.isPollutionSubmitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // ÉTAT TP 01 : INSCRIPTION UTILISATEUR (TEMPLATE FORMS)
  // ==========================================
  user: UserSignup = {
    login: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: '',
  };

  isUserSubmitted = false;
  showPassword = false;
  userErrorMessage = '';

  passwordsMatch(): boolean {
    if (!this.user.password || !this.user.confirmPassword) {
      return true;
    }
    return this.user.password === this.user.confirmPassword;
  }

  onUserSubmit(form: NgForm): void {
    this.userErrorMessage = '';

    if (form.invalid) {
      this.userErrorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    if (!this.passwordsMatch()) {
      this.userErrorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isUserSubmitted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  editUserForm(): void {
    this.isUserSubmitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetUserForm(form?: NgForm): void {
    if (form) {
      form.resetForm();
    }
    this.user = {
      login: '',
      password: '',
      confirmPassword: '',
      nom: '',
      prenom: '',
      email: '',
    };
    this.isUserSubmitted = false;
    this.userErrorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
