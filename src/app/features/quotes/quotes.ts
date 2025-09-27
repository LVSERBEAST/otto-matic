import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesService } from './quotes.service';
import { QuoteForm } from './components/quote-form';
import { Job, JobInputs } from './models/job.model';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, QuoteForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes.html',
  styleUrl: './quotes.scss',
})
export class Quotes {
  private readonly service = inject(QuotesService);

  readonly quotes = this.service.quotes;

  createQuote(value: any) {
    const inputs: JobInputs = {
      quoteId: crypto.randomUUID(),
      quoteDate: new Date(),
      status: 'Draft',
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
    };
    const job: Job = this.service.calculateQuote(inputs);
    this.service.addQuote(job);
  }
}
