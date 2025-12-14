import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../application';
import { ANotificationService, User } from '../../../domain';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(ANotificationService);

  private readonly authStore = inject(AuthStore)
  readonly isSubmitted = signal(false);
  isLoading = this.authStore.loading;
  isLogged = this.authStore.logged;

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(7)]],
  });
  constructor() {
    effect(() => {
      const isLogged = this.isLogged();
      const isLoading = this.isLoading();
      if (isLogged && !isLoading) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl ?? '/catalog');
        this.notification.success(`Bienvinido/a ${this.authStore.profile()?.name.firstname + ' ' + this.authStore.profile()?.name.lastname}`);
      }
    })
  }
  get usernameCtrl() {
    return this.loginForm.controls.username;
  }

  get passwordCtrl() {
    return this.loginForm.controls.password;
  }

  readonly errorMessages = computed<string[]>(() => {
    const messages: string[] = [];
    const usernameErrors = this.usernameCtrl.errors;
    const passwordErrors = this.passwordCtrl.errors;

    if (usernameErrors?.['required']) messages.push('El usuario es obligatorio.');
    if (usernameErrors?.['minlength']) {
      messages.push(`El usuario debe tener al menos ${usernameErrors['minlength'].requiredLength} caracteres.`);
    }

    if (passwordErrors?.['required']) messages.push('La contraseña es obligatoria.');
    if (passwordErrors?.['minlength']) {
      messages.push(`La contraseña debe tener al menos ${passwordErrors['minlength'].requiredLength} caracteres.`);
    }

    return messages;
  });

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginPayload = this.loginForm.getRawValue() as User;
    this.authStore.login(loginPayload)
  }
}
