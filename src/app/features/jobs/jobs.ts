import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JobsService } from './jobs.service';
import { JobForm } from './components/job-form/job-form';
import { Job } from '../../core/models/job.model';
import { StatsService } from '../../core/services/stats.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, JobForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jobs.html',
})
export class Jobs {
  private readonly router = inject(Router);
  private readonly jobsService = inject(JobsService);
  private readonly statsService = inject(StatsService);

  readonly jobs = this.jobsService.jobs;
  readonly statsCollapsed = signal(false);
  readonly stats = this.statsService.createReactiveJobStats(this.jobs);

  createJob(value: any) {
    const job: Job = {
      id: crypto.randomUUID(),
      jobDate: new Date(),
      stage: 'Draft',
      jobType: value.jobType || 'Other',
      clientId: value.clientId,
      quoteIds: [value.quoteId],
      clientName: value.clientName,
      material: value.material,
      quantity: value.quantity,
      size: value.size,
      finishType: value.finishType,
      totalPrice: value.totalPrice,
      stock: [],
      subJobs: [],
      tooling: [],
      printProcesses: [],
      productionNotes: '',
      clientNotes: value.notes,
      hasQuote: false,
    };

    this.jobsService.addJob(job);
  }

  editJob(job: Job) {
    console.log('Edit job:', job.id);
  }

  updateJobStage(job: Job) {
    const stages = ['Draft', 'Approved', 'Production', 'Sent'];
    const currentIndex = stages.indexOf(job.stage);
    const nextStage = stages[(currentIndex + 1) % stages.length] as any;

    const updatedJob = { ...job, stage: nextStage };
    this.jobsService.updateJob(updatedJob);
  }

  deleteJob(jobId: string) {
    this.jobsService.deleteJob(jobId);
  }

  loadTemplate(templateType: string) {
    console.log('Load template:', templateType);
  }

  getRecentJobs(): Job[] {
    return [...this.jobs()]
      .sort((a, b) => new Date(b.jobDate).getTime() - new Date(a.jobDate).getTime())
      .slice(0, 10);
  }

  createQuoteFromJob(job: Job) {
    this.router.navigate(['/admin/quotes'], {
      queryParams: { fromJob: job.id, clientId: job.clientId },
    });
  }
}
