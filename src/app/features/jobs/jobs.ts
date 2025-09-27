import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobsService } from './jobs.service';
import { JobForm } from './components/job-form/job-form';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, JobForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs {
  private readonly service = inject(JobsService);

  readonly jobs = this.service.jobs;
  readonly error = this.service.error;

  readonly stats = computed(() => {
    const allJobs = this.jobs();
    return {
      total: allJobs.length,
      draft: allJobs.filter((j) => j.stage === 'Draft').length,
      approved: allJobs.filter((j) => j.stage === 'Approved').length,
      production: allJobs.filter((j) => j.stage === 'Production').length,
      completed: allJobs.filter((j) => j.stage === 'Sent').length,
    };
  });

  createJob(jobData: any) {
    // Create job from form data
    const job: Job = {
      id: crypto.randomUUID(),
      jobDate: new Date(),
      stage: 'Draft',
      jobType: jobData.jobType || 'Other',
      clientId: jobData.clientId,
      quoteId: jobData.quoteId || '',
      clientName: jobData.clientName,
      material: jobData.material,
      quantity: jobData.quantity,
      size: jobData.size || '',
      finishType: jobData.finishType,
      totalPrice: jobData.totalPrice || 0,
      stock: [],
      subJobs: [],
      tooling: [],
      printProcesses: [],
      productionNotes: '',
      clientNotes: jobData.notes || '',
    };
    this.service.addJob(job);
  }

  updateJobStage(job: Job, newStage: any) {
    const updatedJob = { ...job, stage: newStage };
    this.service.updateJob(updatedJob);
  }

  deleteJob(jobId: string) {
    this.service.deleteJob(jobId);
  }
}
