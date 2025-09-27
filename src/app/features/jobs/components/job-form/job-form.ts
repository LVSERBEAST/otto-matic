import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../../core/firebase.service';
import { Client } from '../../../../core/models/client.model';

interface JobFormValue {
  clientId: string;
  clientName: string;
  material: string;
  quantity: number;
  finishType: string;
  jobType: string;
  size: string;
  notes: string;
  totalPrice: number;
}

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-form.html',
})
export class JobForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly firebase = inject(FirebaseService);

  readonly clients = signal<ReadonlyArray<Client>>([]);

  readonly form = this.fb.nonNullable.group({
    clientId: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    clientName: this.fb.nonNullable.control<string>(''),
    material: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    quantity: this.fb.nonNullable.control<number>(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
    finishType: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    jobType: this.fb.nonNullable.control<string>('Other'),
    size: this.fb.nonNullable.control<string>(''),
    notes: this.fb.nonNullable.control<string>(''),
    totalPrice: this.fb.nonNullable.control<number>(0, { validators: [Validators.min(0)] }),
  });

  readonly submitted = output<JobFormValue>();

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

    const formValue = this.form.getRawValue();
    this.submitted.emit(formValue);
    this.resetForm();
  }

  resetForm() {
    this.form.reset({
      clientId: '',
      clientName: '',
      material: '',
      quantity: 1,
      finishType: '',
      jobType: 'Other',
      size: '',
      notes: '',
      totalPrice: 0,
    });
  }
}