import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  if (typeof window === 'undefined') {
    return true; // SSR safe
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  if (authService.isLoggedIn() && user && user.role === 'ADMIN') {
    return true;
  }

  if (authService.isLoggedIn()) {
    // Logged in but not admin
    router.navigate(['/']);
    return false;
  }

  // Not logged in — redirect to login with return url
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
