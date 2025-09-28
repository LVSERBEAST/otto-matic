import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JobsService } from './jobs.service';
import { JobForm } from './components/job-form/job-form';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, JobForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jobs.html',
})
export class Jobs {
  private readonly jobsService = inject(JobsService);

  readonly jobs = this.jobsService.jobs;

  readonly stats = computed(() => {
    const allJobs = this.jobs();
    const totalValue = allJobs.reduce((sum, job) => sum + job.totalPrice, 0);

    return {
      totalJobs: allJobs.length,
      totalValue,
      draftCount: allJobs.filter((j) => j.stage === 'Draft').length,
      avgJobValue: allJobs.length > 0 ? totalValue / allJobs.length : 0,
    };
  });

  createJob(value: any) {
    const job: Job = {
      id: crypto.randomUUID(),
      jobDate: new Date(),
      stage: 'Draft',
      jobType: value.jobType || 'Other',
      clientId: value.clientId,
      quoteId: value.quoteId || '',
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

  getTotalValue(): number {
    return this.jobs().reduce((sum, job) => sum + job.totalPrice, 0);
  }

  getDraftCount(): number {
    return this.jobs().filter((j) => j.stage === 'Draft').length;
  }

  getAvgJobValue(): number {
    const jobs = this.jobs();
    return jobs.length > 0 ? this.getTotalValue() / jobs.length : 0;
  }

  getRecentJobs(): Job[] {
    return [...this.jobs()]
      .sort((a, b) => new Date(b.jobDate).getTime() - new Date(a.jobDate).getTime())
      .slice(0, 10);
  }
}
