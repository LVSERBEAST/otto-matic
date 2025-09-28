import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuotesService } from './quotes.service';
import { JobsService } from '../jobs/jobs.service';
import { QuoteForm } from './components/quote-form/quote-form';
import { Quote } from '../../core/models/quote.model';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, QuoteForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes.html',
})
export class Quotes {
  private readonly quotesService = inject(QuotesService);
  private readonly jobsService = inject(JobsService);
  private readonly router = inject(Router);

  readonly quotes = this.quotesService.quotes;

  readonly stats = computed(() => {
    const allQuotes = this.quotes();
    const totalValue = allQuotes.reduce((sum, quote) => sum + quote.totalPrice, 0);

    return {
      totalQuotes: allQuotes.length,
      totalValue,
      pendingCount: allQuotes.filter((q) => !q.isExported).length,
      avgQuoteValue: allQuotes.length > 0 ? totalValue / allQuotes.length : 0,
    };
  });

  createQuote(value: any) {
    const quote: Quote = {
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
      totalPrice: 0,
    };

    const calculatedQuote = this.quotesService.calculateQuote(quote);
    this.quotesService.addQuote(calculatedQuote);
  }

  editQuote(quote: Quote) {
    // TODO: Implement quote editing modal or navigate to edit form
    console.log('Edit quote:', quote.quoteId);
  }

  convertToJob(quote: Quote) {
    // Create job from quote and navigate to jobs page
    const job = this.jobsService.createJobFromQuote(quote);
    this.jobsService.addJob(job);

    // Optionally navigate to jobs page to show the new job
    this.router.navigate(['/jobs']);
  }

  deleteQuote(quoteId: string) {
    this.quotesService.deleteQuote(quoteId);
  }

  loadTemplate(templateType: string) {
    // TODO: Implement quote templates
    console.log('Load template:', templateType);

    // Example template loading logic
    const templates = {
      'business-cards': {
        material: 'Crane Lettra 220gsm',
        quantity: 500,
        pricePerUnit: 0.5,
        size: '3.5 × 2 inches',
        finishType: 'Letterpress',
        setupFee: 75,
      },
      invitations: {
        material: 'Crane Lettra 300gsm',
        quantity: 150,
        pricePerUnit: 3.5,
        size: '5 × 7 inches',
        finishType: 'Letterpress + Foil',
        setupFee: 125,
      },
      menus: {
        material: 'Cotton Paper 250gsm',
        quantity: 100,
        pricePerUnit: 4.25,
        size: '8.5 × 11 inches',
        finishType: 'Letterpress',
        setupFee: 85,
      },
      posters: {
        material: 'Fine Art Paper',
        quantity: 50,
        pricePerUnit: 12.0,
        size: '18 × 24 inches',
        finishType: 'Letterpress',
        setupFee: 150,
      },
    };

    // This would populate the quote form with template values
    // Implementation depends on how you want to handle form state
  }

  // Quote-specific helper methods
  getTotalValue(): number {
    return this.quotes().reduce((sum, quote) => sum + quote.totalPrice, 0);
  }

  getPendingCount(): number {
    return this.quotes().filter((q) => !q.isExported).length;
  }

  getAvgQuoteValue(): number {
    const quotes = this.quotes();
    return quotes.length > 0 ? this.getTotalValue() / quotes.length : 0;
  }

  getRecentQuotes(): Quote[] {
    return [...this.quotes()]
      .sort((a, b) => new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime())
      .slice(0, 10);
  }
}
