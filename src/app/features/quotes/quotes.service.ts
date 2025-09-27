import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { Client } from '../../core/models/client.model';
import { Job, JobInputs } from './models/job.model';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly fb = inject(FirebaseService);

  private readonly quotesSignal = signal<ReadonlyArray<Job>>([]);
  readonly quotes = computed(() => this.quotesSignal());

  // Cache clients for synchronous lookup during calculations
  private readonly clientsSignal = signal<ReadonlyArray<Client>>([]);

  constructor() {
    this.fb
      .fetchClients()
      .pipe(take(1))
      .subscribe((list) => this.clientsSignal.set(list));

    // Load and stream quotes if Firestore is configured
    this.fb.streamQuotes().subscribe((items) => this.quotesSignal.set(items));
  }

  // simple access to client list (mocked)
  getClients() {
    return this.fb.fetchClients();
  }

  // Calculate final Job from JobInputs using client data for discounts and tax
  calculateQuote(inputs: JobInputs): Job {
    const client = this.clientsSignal().find((x) => x.id === inputs.clientId);
    const discountRate = inputs.discountRate ?? client?.defaultDiscountRate ?? 0;
    const isTaxExempt = client?.isTaxExempt ?? false;

    const subTotal = inputs.quantity * inputs.pricePerUnit;
    const discount = subTotal * discountRate;
    const taxRate = isTaxExempt ? 0 : 0.07; // 7% example tax
    const taxableAmount = Math.max(subTotal - discount + inputs.setupFee, 0);
    const tax = taxableAmount * taxRate;
    const totalPrice = subTotal + inputs.setupFee - discount + tax;

    const job: Job = {
      ...inputs,
      subTotal,
      totalPrice,
    };
    return job;
  }

  addQuote(job: Job) {
    const next = [...this.quotesSignal(), job];
    this.quotesSignal.set(next);
    return this.fb.saveQuote(job).pipe(take(1)).subscribe();
  }

  updateQuote(job: Job) {
    return this.fb.updateQuote(job).pipe(take(1)).subscribe();
  }

  deleteQuote(quoteId: string) {
    this.quotesSignal.set(this.quotesSignal().filter((q) => q.quoteId !== quoteId));
    return this.fb.deleteQuote(quoteId).pipe(take(1)).subscribe();
  }
}
