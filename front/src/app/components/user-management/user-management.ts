import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/user.model';
import { HttpTrafficService } from '../../services/http-traffic.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!password || !confirmPassword) {
    return null;
  }
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-user-management',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagementComponent implements OnInit {
  readonly userService = inject(UserService);
  readonly trafficService = inject(HttpTrafficService);
  private readonly fb = inject(FormBuilder);

  readonly availableRoles: UserRole[] = [
    'Éco-Citoyen',
    'Sentinelle de Terrain',
    'Analyste Environnemental',
  ];

  readonly activeTab = signal<'list' | 'create' | 'login'>('list');
  readonly showPassword = signal<boolean>(false);
  readonly formSubmitted = signal<boolean>(false);
  readonly loginSubmitted = signal<boolean>(false);

  readonly users = this.userService.users;
  readonly currentUser = this.userService.currentUser;
  readonly isLoading = this.userService.isLoading;
  readonly errorMessage = this.userService.error;
  readonly lastMessage = this.userService.lastActionMessage;
  readonly totalUsers = this.userService.totalUsersCount;

  signupForm!: FormGroup;
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadUsers();
  }

  private initForms(): void {
    this.signupForm = this.fb.group(
      {
        login: ['', [Validators.required, Validators.minLength(3)]],
        nom: ['', [Validators.required, Validators.minLength(2)]],
        prenom: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['Éco-Citoyen', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );

    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      error: () => {
        // L'erreur est gérée dans le signal error du service
      },
    });
  }

  submitSignup(): void {
    this.formSubmitted.set(true);
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { login, nom, prenom, email, role, password } = this.signupForm.value;

    this.userService
      .createUser({
        login,
        nom,
        prenom,
        email,
        role,
        password,
      })
      .subscribe({
        next: () => {
          this.signupForm.reset({ role: 'Éco-Citoyen' });
          this.formSubmitted.set(false);
          this.activeTab.set('list');
        },
      });
  }

  submitLogin(): void {
    this.loginSubmitted.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { login, password } = this.loginForm.value;
    this.userService
      .login({
        login,
        password,
      })
      .subscribe({
        next: () => {
          this.loginForm.reset();
          this.loginSubmitted.set(false);
          this.activeTab.set('list');
        },
      });
  }

  quickLoginAs(login: string): void {
    this.userService
      .login({
        login,
        password: 'Password123!',
      })
      .subscribe({
        next: () => {
          this.activeTab.set('list');
        },
      });
  }

  deleteUser(id: number | string): void {
    if (confirm(`Confirmez-vous la suppression de l'utilisateur #${id} ?`)) {
      this.userService.deleteUser(id).subscribe();
    }
  }

  logout(): void {
    this.userService.logout();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }
}
