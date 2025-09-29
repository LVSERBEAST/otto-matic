import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGaugeHigh,
  faPrint,
  faCalculator,
  faAddressBook,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly showActions = signal(false);

  faGaugeHigh = faGaugeHigh;
  faPrint = faPrint;
  faCalculator = faCalculator;
  faAddressBook = faAddressBook;
  faEnvelope = faEnvelope;

  toggleActions() {
    this.showActions.update((current) => !current);
  }

  logout() {
    this.auth.logout();
  }
}
