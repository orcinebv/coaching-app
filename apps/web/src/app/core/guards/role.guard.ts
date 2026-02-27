import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const user = authStore.user();
  if (user?.role === 'ADMIN') return true;

  router.navigate(['/dashboard']);
  return false;
};

export const coachGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const user = authStore.user();
  if (user?.role === 'COACH' || user?.role === 'ADMIN') return true;

  router.navigate(['/dashboard']);
  return false;
};
