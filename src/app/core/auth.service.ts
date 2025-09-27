import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models/user.model';
import { FirebaseService } from './firebase.service';
import type { User as FirebaseUser } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly fb = inject(FirebaseService);

  private readonly currentUserSignal = signal<User | undefined>(undefined);
  readonly authError = signal<string | null>(null);

  // Public readonly selectors
  readonly user = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  readonly isDevOrAdmin = computed(() => {
    const role = this.currentUserSignal()?.role;
    return role === 'admin' || role === 'dev';
  });

  login(role: 'admin' | 'dev'): void {
    if (role === 'admin') {
      // Testing-only path: set an admin user without Firebase.
      const user: User = {
        id: crypto.randomUUID(),
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };
      this.currentUserSignal.set(user);
      void this.router.navigate(['/quotes']);
      return;
    }
    this.loginWithGoogle();
  }

  logout(): void {
    this.fb.signOut().subscribe({
      next: () => {
        this.currentUserSignal.set(undefined);
        void this.router.navigate(['/']);
      },
      error: () => {
        this.currentUserSignal.set(undefined);
        void this.router.navigate(['/']);
      },
    });
  }

  // Firebase auth integration
  private readonly adminEmails = new Set<string>(['admin@example.com']); // TODO: replace with your admins

  private mapFirebaseUser(u: FirebaseUser): User {
    const email = u.email ?? '';
    const role: User['role'] = this.adminEmails.has(email) ? 'admin' : 'dev';
    return {
      id: u.uid,
      name: u.displayName || email || 'User',
      email,
      role,
    };
  }

  loginWithGoogle(): void {
    this.authError.set(null);
    this.fb.signInWithGoogle().subscribe({
      next: (u) => {
        if (u && u.uid) {
          this.currentUserSignal.set(this.mapFirebaseUser(u));
          void this.router.navigate(['/quotes']);
        }
      },
      error: (e) => {
        this.authError.set(this.formatAuthError(e));
      },
    });
  }

  loginWithEmailPassword(email: string, password: string): void {
    this.authError.set(null);
    this.fb.signInWithEmailPassword(email, password).subscribe({
      next: (u) => {
        if (u && u.uid) {
          this.currentUserSignal.set(this.mapFirebaseUser(u));
          void this.router.navigate(['/quotes']);
        }
      },
      error: (e) => {
        this.authError.set(this.formatAuthError(e));
      },
    });
  }

  constructor() {
    // Keep Angular signals in sync with Firebase auth state
    this.fb.onAuthState((u) => {
      if (u) {
        this.currentUserSignal.set(this.mapFirebaseUser(u));
      } else {
        this.currentUserSignal.set(undefined);
      }
    });
  }

  private formatAuthError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    const map: Record<string, string> = {
      'auth/invalid-email': 'The email address is invalid.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with that email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
    };
    if (code && map[code]) return map[code];
    return 'Sign-in failed. Please try again.';
  }
}
