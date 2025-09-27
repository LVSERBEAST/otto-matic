import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';
import { ClientsService } from './clients.service';
import { Client } from '../../core/models/client.model';

type ClientForm = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  website: FormControl<string>;
  street: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  zip: FormControl<string>;
  isTaxExempt: FormControl<boolean>;
  defaultDiscountRate: FormControl<number>;
  notes: FormControl<string>;
}>;

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',changeDetection: ChangeDetectionStrategy.OnPush
})
export class Clients {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ClientsService);

  readonly clients = this.svc.clients;
  readonly error = this.svc.error;

  readonly form: ClientForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    website: ['', []],
    street: ['', []],
    city: ['', []],
    state: ['', []],
    zip: ['', []],
    isTaxExempt: [false],
    defaultDiscountRate: [0, [Validators.min(0), Validators.max(1)]],
    notes: ['']
  });

  submitting = signal(false);
  errorMsg = signal<string | null>(null);

  submit() {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const {
      name,
      email,
      phone,
      website,
      street,
      city,
      state,
      zip,
      isTaxExempt,
      defaultDiscountRate,
      notes
    } = this.form.getRawValue();
    const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
    const safeRate = Number.isFinite(defaultDiscountRate) ? clamp(defaultDiscountRate, 0, 1) : 0;
    const payload: Omit<Client, 'id'> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website?.trim() ?? '',
      street: street?.trim() ?? '',
      city: city?.trim() ?? '',
      state: state?.trim() ?? '',
      zip: zip?.trim() ?? '',
      isTaxExempt,
      defaultDiscountRate: safeRate,
      notes: notes?.trim() ?? ''
    };
    this.svc.create(payload);
    this.form.reset({
      name: '',
      email: '',
      phone: '',
      website: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      isTaxExempt: false,
      defaultDiscountRate: 0,
      notes: ''
    });
    // Allow a microtask for async service to push state; then stop submitting
    queueMicrotask(() => this.submitting.set(false));
  }

  remove(id: string) {
    this.svc.delete(id);
  }
}
