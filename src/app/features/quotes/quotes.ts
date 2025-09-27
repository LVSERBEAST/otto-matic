import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesService } from './quotes.service';
import { QuoteForm } from './components/quote-form/quote-form';
import { Job, Quote } from './models/job.model';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, QuoteForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes.html',
})
export class Quotes {
  private readonly service = inject(QuotesService);

  readonly quotes = this.service.quotes;

  createQuote(value: any) {
    const inputs: Quote = {
      quoteId: crypto.randomUUID(),
      quoteDate: new Date(),
      clientId: value.clientId,
      clientName: value.clientName,
      material: value.material,
      quantity: value.quantity,
      pricePerUnit: value.pricePerUnit,
      size: value.size,
      finishType: value.finishType,
      notes: value.notes,
      setupFee: value.setupFee,
      discountRate: value.discountRate,
      isExported: false,
      subTotal: 0,
      totalPrice: 0
    };
    const quote: Quote = this.service.calculateQuote(inputs);
    this.service.addQuote(quote);
  }

  getTotalValue(): number {
    return this.quotes().reduce((sum, quote) => sum + quote.totalPrice, 0);
  }

  getDraftCount(): number {
    return this.quotes().filter((q) => q.status === 'Draft').length;
  }

  getApprovedCount(): number {
    return this.quotes().filter((q) => q.status === 'Approved').length;
  }

  getInProductionCount(): number {
    // For now, return 0 since we don't have "In Production" status yet
    return 0;
  }

  getCompletedCount(): number {
    return this.quotes().filter((q) => q.status === 'Sent').length;
  }

  getRecentQuotes(): Job[] {
    return [...this.quotes()]
      .sort((a, b) => new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime())
      .slice(0, 8);
  }

  getJobsByStatus(status: string): Job[] {
    if (status === 'New Requests') {
      return this.quotes().filter((q) => q.status === 'Draft');
    }
    if (status === 'Ready to Start') {
      return this.quotes().filter((q) => q.status === 'Approved');
    }
    if (status === 'In Production') {
      // For now, return empty array since we don't have this status
      return [];
    }
    if (status === 'Completed') {
      return this.quotes().filter((q) => q.status === 'Sent');
    }
    return [];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Draft':
        return 'var(--surface-elevated)';
      case 'Approved':
        return 'rgba(16, 185, 129, 0.1)';
      case 'Sent':
        return 'rgba(59, 130, 246, 0.1)';
      default:
        return 'var(--surface-elevated)';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'Draft':
        return 'var(--text-tertiary)';
      case 'Approved':
        return 'rgb(16, 185, 129)';
      case 'Sent':
        return 'rgb(59, 130, 246)';
      default:
        return 'var(--text-tertiary)';
    }
  }

  // Placeholder for drag and drop functionality
  onJobMoved(job: Job, newStatus: string) {
    // This will be implemented when we add drag and drop library
    console.log(`Moving job ${job.quoteId} to ${newStatus}`);
  }
}
