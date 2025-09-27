import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const fb = inject(FirebaseService);

  // Fast path if we already have a user
  if (auth.isDevOrAdmin()) return true;

  // Wait for the first Firebase auth state emission (on page refresh)
  const user = await new Promise<unknown>((resolve) => {
    let settled = false;
    fb.onAuthState((u) => {
      if (!settled) {
        settled = true;
        resolve(u);
      }
    });
  });

  // Re-check after Firebase restored (or confirmed no user)
  return auth.isDevOrAdmin() ? true : router.createUrlTree(['/']);
};
