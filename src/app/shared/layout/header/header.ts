import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { LoginModal } from '../../auth/login-modal/login-modal';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UpperCasePipe, LoginModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss'})
export class Header {
  private readonly auth = inject(AuthService);

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly userRole = computed(() => this.auth.user()?.role ?? 'guest');

  // Modal state
  readonly openLogin = signal(false);
  readonly requestedRole = signal<'admin' | 'dev' | undefined>(undefined);

  openModal(role: 'admin' | 'dev') {
    this.requestedRole.set(role);
    this.openLogin.set(true);
  }

  logout() {
    this.auth.logout();
  }
}
