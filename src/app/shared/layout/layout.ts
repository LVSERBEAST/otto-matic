import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { LoginModal } from '../auth/login-modal/login-modal';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LoginModal, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout.html',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly userRole = computed(() => this.auth.user()?.role ?? 'guest');

  // Modal state
  readonly openLogin = signal(false);
  readonly requestedRole = signal<'admin' | 'dev' | undefined>(undefined);

  // Current route for header title
  readonly currentRoute = signal('/dashboard');
  readonly showActions = signal(false);

  toggleActions() {
    this.showActions.update((current) => !current);
  }

  constructor() {
    // Track current route
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => (event as NavigationEnd).url)
      )
      .subscribe((url) => {
        this.currentRoute.set(url);
      });
  }

  openModal(role: 'admin' | 'dev') {
    this.requestedRole.set(role);
    this.openLogin.set(true);
  }

  logout() {
    this.auth.logout();
  }
}
