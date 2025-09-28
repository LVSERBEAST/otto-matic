import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { Job, JobStage } from '../../core/models/job.model';
import { Quote } from '../../core/models/quote.model';
import { take } from 'rxjs';
import { QuotesService } from '../quotes/quotes.service';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly fb = inject(FirebaseService);
  private readonly quotesService = inject(QuotesService);

  private readonly jobsSignal = signal<ReadonlyArray<Job>>([]);
  readonly jobs = computed(() => this.jobsSignal());

  private readonly errorSignal = signal<string | null>(null);
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.fb.streamJobs().subscribe((items) => {
      const quotes = this.quotesService.quotes();

      const jobsMapped = items.map((job) => ({
        ...job,
        hasQuote: quotes.some((quote) => quote.jobId === job.id),
      }));

      console.log('jobsMapped', jobsMapped);

      this.jobsSignal.set(jobsMapped);
    });
  }

  createJobFromQuote(quote: Quote, jobType: string = 'Other'): Job {
    const job: Job = {
      id: crypto.randomUUID(),
      jobDate: new Date(),
      stage: 'Draft',
      jobType: jobType as any,
      clientId: quote.clientId,
      quoteIds: [quote.quoteId],
      clientName: quote.clientName,
      material: quote.material,
      quantity: quote.quantity,
      size: quote.size,
      finishType: quote.finishType,
      totalPrice: quote.totalPrice,
      stock: [],
      subJobs: [],
      tooling: [],
      printProcesses: [],
      productionNotes: '',
      clientNotes: quote.notes,
    };
    return job;
  }

  addJob(job: Job) {
    const next = [...this.jobsSignal(), job];
    this.jobsSignal.set(next);
    return this.fb.saveJob(job).pipe(take(1)).subscribe();
  }

  updateJob(job: Job) {
    const next = this.jobsSignal().map((j) => (j.id === job.id ? { ...job } : j));
    this.jobsSignal.set(next);
    return this.fb.updateJob(job).pipe(take(1)).subscribe();
  }

  deleteJob(jobId: string) {
    this.jobsSignal.set(this.jobsSignal().filter((j) => j.id !== jobId));
    return this.fb.deleteJob(jobId).pipe(take(1)).subscribe();
  }

  getJobsByStage(stage: JobStage): Job[] {
    return this.jobs().filter((job) => job.stage === stage);
  }

  moveJobToStage(jobId: string, newStage: JobStage) {
    const job = this.jobs().find((j) => j.id === jobId);
    if (job) {
      const updatedJob = { ...job, stage: newStage };
      this.updateJob(updatedJob);
    }
  }
}