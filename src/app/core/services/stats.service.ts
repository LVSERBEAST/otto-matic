import { Injectable, computed, signal } from '@angular/core';
import { Job } from '../models/job.model';
import { Quote } from '../models/quote.model';
import { Client } from '../models/client.model';

export interface JobStats {
  totalJobs: number;
  totalValue: number;
  draftCount: number;
  approvedCount: number;
  productionCount: number;
  completedCount: number;
  avgJobValue: number;
}

export interface QuoteStats {
  totalQuotes: number;
  totalValue: number;
  pendingCount: number;
  convertedCount: number;
  avgQuoteValue: number;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  taxExemptCount: number;
  avgDiscountRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  
  calculateJobStats(jobs: readonly Job[]): JobStats {
    const totalValue = jobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0);
    
    return {
      totalJobs: jobs.length,
      totalValue,
      draftCount: jobs.filter(j => j.stage === 'Draft').length,
      approvedCount: jobs.filter(j => j.stage === 'Approved').length,
      productionCount: jobs.filter(j => j.stage === 'Production').length,
      completedCount: jobs.filter(j => j.stage === 'Sent').length,
      avgJobValue: jobs.length > 0 ? totalValue / jobs.length : 0,
    };
  }

  calculateQuoteStats(quotes: readonly Quote[]): QuoteStats {
    const totalValue = quotes.reduce((sum, quote) => sum + (quote.totalPrice || 0), 0);
    
    return {
      totalQuotes: quotes.length,
      totalValue,
      pendingCount: quotes.filter(q => !q.isExported).length,
      convertedCount: quotes.filter(q => q.isExported).length,
      avgQuoteValue: quotes.length > 0 ? totalValue / quotes.length : 0,
    };
  }

  calculateClientStats(clients: readonly Client[]): ClientStats {
    const taxExemptCount = clients.filter(c => c.isTaxExempt).length;
    const totalDiscount = clients.reduce((sum, c) => sum + (c.defaultDiscountRate || 0), 0);
    
    return {
      totalClients: clients.length,
      activeClients: clients.length, // Assuming all clients are active for now
      taxExemptCount,
      avgDiscountRate: clients.length > 0 ? totalDiscount / clients.length : 0,
    };
  }

  /**
   * Create reactive stats that update when the source data changes
   */
  createReactiveJobStats(jobsSignal: () => readonly Job[]) {
    return computed(() => this.calculateJobStats(jobsSignal()));
  }

  createReactiveQuoteStats(quotesSignal: () => readonly Quote[]) {
    return computed(() => this.calculateQuoteStats(quotesSignal()));
  }

  createReactiveClientStats(clientsSignal: () => readonly Client[]) {
    return computed(() => this.calculateClientStats(clientsSignal()));
  }
}
