import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth-service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  if (authService.isLoggedIn()) {
    // If already logged in, sends to the role dashboard and blocks the login page
    authService.redirectUser();
    return false;
  }
  
  // If not logged in, allows login
  return true;
};