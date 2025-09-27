import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { JobsService } from '../jobs/jobs.service';
import { ClientsService } from '../clients/clients.service';
import { AuthService } from '../../core/auth.service';
import { Job, JobStage } from '../../core/models/job.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'})
export class Dashboard {
  private readonly jobsService = inject(JobsService);
  private readonly clientsService = inject(ClientsService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly jobs = this.jobsService.jobs;
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
    const allJobs = this.jobs();
    const totalValue = allJobs.reduce((sum, j) => sum + j.totalPrice, 0);

    return {
      totalJobs: allJobs.length,
      totalValue,
      totalClients: this.clients().length,
      avgJobValue: allJobs.length > 0 ? totalValue / allJobs.length : 0,
      drafts: this._draftJobs().length,
      approved: this._approvedJobs().length,
      production: this._productionJobs().length,
      completed: this._completedJobs().length
    };
  });

  constructor() {
    // Update job arrays when jobs change - maintains stable references
    effect(() => {
      const allJobs = this.jobs();

      const newDrafts = allJobs.filter((j) => j.stage === 'Draft');
      const newApproved = allJobs.filter((j) => j.stage === 'Approved');
      const newProduction = allJobs.filter((j) => j.stage === 'Production');
      const newCompleted = allJobs.filter((j) => j.stage === 'Sent');

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

    const job = event.previousContainer.data[event.previousIndex];
    const newStage = this.getStageByContainerId(event.container.id);
    const updatedJob: Job = { ...job, stage: newStage };

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    this.jobsService.updateJob(updatedJob);
  }

  openJobModal(job: Job) {
    this.selectedJob.set(job);
  }

  closeJobModal() {
    this.selectedJob.set(null);
  }

  formatJobId(job: Job): string {
    const prefix = job.clientName.substring(0, 3).toUpperCase();
    return `${prefix}-${job.id.substring(0, 3)}`;
  }

  private arraysEqual(a: Job[], b: Job[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((job, index) => job.id === b[index]?.id);
  }

  private getStageByContainerId(id: string): JobStage {
    const stageMap: Record<string, JobStage> = {
      'new-requests': 'Draft',
      'ready-to-start': 'Approved',
      'in-production': 'Production',
      completed: 'Sent'
    };
    return stageMap[id];
  }
}
