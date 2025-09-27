import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { Job, JobStage } from '../../core/models/job.model';
import { Quote } from '../../core/models/quote.model';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly fb = inject(FirebaseService);

  private readonly jobsSignal = signal<ReadonlyArray<Job>>([]);
  readonly jobs = computed(() => this.jobsSignal());

  private readonly errorSignal = signal<string | null>(null);
  readonly error = computed(() => this.errorSignal());

  constructor() {
    // Load and stream jobs if Firestore is configured
    this.fb.streamJobs().subscribe((items) => this.jobsSignal.set(items));
  }

  createJobFromQuote(quote: Quote, jobType: string = 'Other'): Job {
    const job: Job = {
      id: crypto.randomUUID(),
      jobDate: new Date(),
      stage: 'Draft',
      jobType: jobType as any,
      clientId: quote.clientId,
      quoteId: quote.quoteId,
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