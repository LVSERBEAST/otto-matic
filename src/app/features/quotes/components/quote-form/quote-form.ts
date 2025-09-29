import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../../core/firebase.service';
import { Client } from '../../../../core/models/client.model';
import { BaseFormComponent } from '../../../../shared/components/base-form/base-form.component';

interface QuoteFormValue {
  clientId: string;
  clientName: string;
  material: string;
  quantity: number;
  pricePerUnit: number;
  size: string;
  finishType: string;
  notes: string;
  setupFee: number;
  discountRate: number;
}

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote-form.html',
})
export class QuoteForm extends BaseFormComponent<QuoteFormValue> {
  private readonly firebase = inject(FirebaseService);

  readonly clients = signal<ReadonlyArray<Client>>([]);

  // Typed form group
  readonly form = this.fb.nonNullable.group({
    clientId: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    clientName: this.fb.nonNullable.control<string>(''),
    material: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    quantity: this.fb.nonNullable.control<number>(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
    pricePerUnit: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    size: this.fb.nonNullable.control<string>(''),
    finishType: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    notes: this.fb.nonNullable.control<string>(''),
    setupFee: this.fb.nonNullable.control<number>(0, { validators: [Validators.min(0)] }),
    discountRate: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
  });

  constructor() {
    super();
    this.firebase.fetchClients().subscribe((list) => this.clients.set(list));

    // Update clientName when clientId changes
    this.form.controls.clientId.valueChanges.subscribe((id) => {
      const match = this.clients().find((c) => c.id === id);
      this.form.controls.clientName.setValue(match?.name ?? '', { emitEvent: false });
    });
  }

  resetForm() {
    this.form.reset({
      clientId: '',
      clientName: '',
      material: '',
      quantity: 1,
      pricePerUnit: 0,
      size: '',
      finishType: '',
      notes: '',
      setupFee: 0,
      discountRate: 0,
    });
  }
}
