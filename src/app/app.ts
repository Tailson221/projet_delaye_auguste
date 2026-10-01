import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Modèle de données lié au formulaire via [(ngModel)]
  user: UserSignup = {
    login: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: '',
  };

  // État de soumission du formulaire
  isSubmitted = false;
  showPassword = false;
  errorMessage = '';

  // Vérification de la correspondance des mots de passe
  passwordsMatch(): boolean {
    if (!this.user.password || !this.user.confirmPassword) {
      return true; // Ne pas afficher d'erreur prématurée si l'un est vide
    }
    return this.user.password === this.user.confirmPassword;
  }

  // Soumission du formulaire (appelé par (ngSubmit)="onSubmit(signupForm)")
  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    if (!this.passwordsMatch()) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    // Validation réussie -> Affichage de la vue récapitulative
    this.isSubmitted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Masquer / Afficher le mot de passe
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Modifier les informations (retour au formulaire avec conservation des données)
  editForm(): void {
    this.isSubmitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Recommencer une nouvelle inscription
  resetForm(form?: NgForm): void {
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
    this.isSubmitted = false;
    this.errorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
