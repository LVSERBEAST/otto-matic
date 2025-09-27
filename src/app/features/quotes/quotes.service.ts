import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { Client } from '../../core/models/client.model';
import { Job, Quote } from './models/job.model';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly fb = inject(FirebaseService);

  private readonly quotesSignal = signal<ReadonlyArray<Quote>>([]);
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
  getClients() {
    return this.fb.fetchClients();
  }

  // Calculate final Job from JobInputs using client data for discounts and tax
  calculateQuote(response: Quote): Quote {
    const client = this.clientsSignal().find((x) => x.id === response.clientId);
    const discountRate = response.discountRate ?? client?.defaultDiscountRate ?? 0;
    const isTaxExempt = client?.isTaxExempt ?? false;

    const subTotal = response.quantity * response.pricePerUnit;
    const discount = subTotal * discountRate;
    const taxRate = isTaxExempt ? 0 : 0.07; // 7% example tax
    const taxableAmount = Math.max(subTotal - discount + response.setupFee, 0);
    const tax = taxableAmount * taxRate;
    const totalPrice = subTotal + response.setupFee - discount + tax;

    const quote: Quote = {
      ...response,
      subTotal,
      totalPrice,
    };
    return quote;
  }

  addQuote(quote: Quote) {
    const next = [...this.quotesSignal(), quote];
    this.quotesSignal.set(next);
    return this.fb.saveQuote(quote).pipe(take(1)).subscribe();
  }

  updateQuote(quote: Quote) {
    return this.fb.updateQuote(quote).pipe(take(1)).subscribe();
  }

  deleteQuote(quoteId: string) {
    this.quotesSignal.set(this.quotesSignal().filter((q) => q.quoteId !== quoteId));
    return this.fb.deleteQuote(quoteId).pipe(take(1)).subscribe();
  }
}
