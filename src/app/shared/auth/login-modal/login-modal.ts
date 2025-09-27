import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss'})
export class LoginModal {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly open = input<boolean>(false);
  // Optional context for copy; both roles use Firebase sign-in in this modal
  readonly requestRole = input<'admin' | 'dev' | undefined>();
  readonly close = output<void>();

  readonly signingIn = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    password: this.fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.signingIn.set(false);
        this.error.set(null);
        this.close.emit();
      }
    });

    effect(() => {
      const err = this.auth.authError();
      if (err) {
        this.signingIn.set(false);
        this.error.set(err);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || this.signingIn()) return;
    const { email, password } = this.form.getRawValue();
    this.error.set(null);
    this.signingIn.set(true);
    this.auth.loginWithEmailPassword(email, password);
  }

  onClose() {
    if (this.signingIn()) return; // avoid closing mid-auth
    this.close.emit();
  }
}
