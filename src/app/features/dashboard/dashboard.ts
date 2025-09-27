import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
  effect,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { QuotesService } from '../quotes/quotes.service';
import { ClientsService } from '../clients/clients.service';
import { AuthService } from '../../core/auth.service';
import { Job, JobStatus } from '../quotes/models/job.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly quotesService = inject(QuotesService);
  private readonly clientsService = inject(ClientsService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly quotes = this.quotesService.quotes;
  readonly clients = this.clientsService.clients;
  readonly user = this.auth.user;

  // Stable job arrays for drag-drop - prevent reference changes
  private readonly _draftJobs = signal<Job[]>([]);
  private readonly _approvedJobs = signal<Job[]>([]);
  private readonly _productionJobs = signal<Job[]>([]);
  private readonly _completedJobs = signal<Job[]>([]);

  // Read-only getters for template
  readonly draftJobs = this._draftJobs.asReadonly();
  readonly approvedJobs = this._approvedJobs.asReadonly();
  readonly productionJobs = this._productionJobs.asReadonly();
  readonly completedJobs = this._completedJobs.asReadonly();
  readonly selectedJob = signal<Job | null>(null);

  readonly stats = computed(() => {
    const allQuotes = this.quotes();
    const totalValue = allQuotes.reduce((sum, q) => sum + q.quote.totalPrice, 0);

    return {
      totalQuotes: allQuotes.length,
      totalValue,
      totalClients: this.clients().length,
      avgQuoteValue: allQuotes.length > 0 ? totalValue / allQuotes.length : 0,
      drafts: this._draftJobs().length,
      approved: this._approvedJobs().length,
      production: this._productionJobs().length,
      completed: this._completedJobs().length,
    };
  });

  readonly topClients = computed(() => this.clients().slice(0, 5));

  constructor() {
    // Update job arrays when quotes change - maintains stable references
    effect(() => {
      const allQuotes = this.quotes();

      // Only update if arrays actually changed to maintain stability
      const newDrafts = allQuotes.filter((q) => q.status === 'Draft');
      const newApproved = allQuotes.filter((q) => q.status === 'Approved');
      const newProduction = allQuotes.filter((q) => q.status === 'Production');
      const newCompleted = allQuotes.filter((q) => q.status === 'Sent');

      // Check if we need to update (avoid unnecessary signal updates)
      if (!this.arraysEqual(this._draftJobs(), newDrafts)) {
        this._draftJobs.set([...newDrafts]);
      }
      if (!this.arraysEqual(this._approvedJobs(), newApproved)) {
        this._approvedJobs.set([...newApproved]);
      }
      if (!this.arraysEqual(this._productionJobs(), newProduction)) {
        this._productionJobs.set([...newProduction]);
      }
      if (!this.arraysEqual(this._completedJobs(), newCompleted)) {
        this._completedJobs.set([...newCompleted]);
      }
    });
  }

  onJobDropped(event: CdkDragDrop<Job[], any, any>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    // Get job and update status
    const job = event.previousContainer.data[event.previousIndex];
    const newStatus = this.getStatusByContainerId(event.container.id);
    const updatedJob: Job = { ...job, status: newStatus };

    // Move item between arrays immediately
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Update in service (this will sync but won't cause visual flicker)
    this.quotesService.updateQuote(updatedJob);
  }

  getClientInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  openJobModal(job: Job) {
    this.selectedJob.set(job);
  }

  closeJobModal() {
    this.selectedJob.set(null);
  }

  // Helper to check if arrays are equal (by job IDs)
  private arraysEqual(a: Job[], b: Job[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((job, index) => job.id === b[index]?.id);
  }

  private getStatusByContainerId(id: string): JobStatus {
    const statusMap: Record<string, JobStatus> = {
      'new-requests': 'Draft',
      'ready-to-start': 'Approved',
      'in-production': 'Production',
      completed: 'Sent',
    };
    return statusMap[id];
  }

  // MOVE ELSEWHERE LATER
  formatJobId(job: Job): string {
    const prefix = job.clientName.substring(0, 3).toUpperCase();
    return `${prefix}-${job.id.substring(0, 3)}`;
  }
}
