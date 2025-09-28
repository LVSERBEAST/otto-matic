import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface ClientFormValue {
  name: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isTaxExempt: boolean;
  defaultDiscountRate: number;
  notes: string;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-form.html',
})
export class ClientForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    email: this.fb.nonNullable.control<string>('', { validators: [Validators.required, Validators.email] }),
    phone: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    website: this.fb.nonNullable.control<string>(''),
    street: this.fb.nonNullable.control<string>(''),
    city: this.fb.nonNullable.control<string>(''),
    state: this.fb.nonNullable.control<string>(''),
    zip: this.fb.nonNullable.control<string>(''),
    isTaxExempt: this.fb.nonNullable.control<boolean>(false),
    defaultDiscountRate: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    notes: this.fb.nonNullable.control<string>(''),
  });

  readonly submitted = output<ClientFormValue>();

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    this.submitted.emit(formValue);
    this.resetForm();
  }

  resetForm() {
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
      notes: '',
    });
  }
}
