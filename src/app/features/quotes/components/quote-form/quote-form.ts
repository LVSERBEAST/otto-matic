import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../../core/firebase.service';
import { Client } from '../../../../core/models/client.model';

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
  styleUrl: './quote-form.scss',
})
export class QuoteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
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
    finishType: this.fb.nonNullable.control<string>(''),
    notes: this.fb.nonNullable.control<string>(''),
    setupFee: this.fb.nonNullable.control<number>(0),
    discountRate: this.fb.nonNullable.control<number>(0),
  });

  readonly submitted = output<QuoteFormValue>();

  ngOnInit(): void {
    this.firebase.fetchClients().subscribe((list) => this.clients.set(list));
    // Update clientName when clientId changes
    this.form.controls.clientId.valueChanges.subscribe((id) => {
      const match = this.clients().find((c) => c.id === id);
      this.form.controls.clientName.setValue(match?.name ?? '', { emitEvent: false });
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitted.emit(this.form.getRawValue());
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
