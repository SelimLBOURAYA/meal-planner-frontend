import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { MealPlannerService } from '../../services/meal-planner.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly planner = inject(MealPlannerService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isRegisterMode = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  toggleMode(): void {
    this.isRegisterMode.update((v) => !v);
    this.errorMessage.set(null);
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, name: displayName } = this.form.getRawValue();

    const request$ = this.isRegisterMode()
      ? this.auth.register(displayName, email, password)
      : this.auth.login(email, password);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.planner.initialize();
        void this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.resolveError(err));
      },
    });
  }

  private resolveError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return 'Identifiants invalides. Vérifiez votre e-mail et mot de passe.';
    }
    if (status === 409) {
      return 'Un compte avec cet e-mail existe déjà.';
    }
    if (status === 0) {
      return 'Serveur inaccessible. Vérifiez que le backend est démarré.';
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}
