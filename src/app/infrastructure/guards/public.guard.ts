import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../application';

export const publicGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const hasToken = !!localStorage.getItem('auth_token');
  const isLogged = authStore.logged() || hasToken;

  if (!isLogged) return true;

  router.navigate(['/catalog']);
  return false;
};
