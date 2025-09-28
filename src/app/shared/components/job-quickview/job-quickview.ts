import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-quickview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
@if (open() && job()) {
  <div class="fixed inset-0 z-[150] grid place-items-center p-4" style="background: rgba(0, 0, 0, 0.8);">
    <div class="absolute inset-0" (click)="close.emit()"></div>
    <div class="relative w-full max-w-2xl">
      <div class="w-full p-6" style="background: var(--surface-medium); border: 1px solid var(--border-medium); border-radius: 16px; box-shadow: var(--shadow-xl);">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold mb-2" style="color: var(--text-primary);">{{ job()!.material }}</h2>
            <p class="text-sm" style="color: var(--text-secondary);">{{ job()!.clientName }}</p>
          </div>
          <button 
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style="background: var(--surface-elevated); border: 1px solid var(--border-medium); color: var(--text-secondary);"
            (click)="close.emit()">
            ✕
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="font-medium mb-3" style="color: var(--text-primary);">Job Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Stage:</span>
                <span style="color: var(--text-primary);">{{ job()!.stage }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Type:</span>
                <span style="color: var(--text-primary);">{{ job()!.jobType }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Quantity:</span>
                <span style="color: var(--text-primary);">{{ job()!.quantity }}</span>
              </div>
              @if (job()!.size) {
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Size:</span>
                <span style="color: var(--text-primary);">{{ job()!.size }}</span>
              </div>
              }
            </div>
          </div>
          
          <div>
            <h3 class="font-medium mb-3" style="color: var(--text-primary);">Production</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Process:</span>
                <span style="color: var(--text-primary);">{{ job()!.finishType }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Total:</span>
                <span style="color: var(--brand-accent); font-weight: 600;">{{ job()!.totalPrice | currency }}</span>
              </div>
              @if (job()!.blockingStatus) {
              <div class="flex justify-between">
                <span style="color: var(--text-tertiary);">Status:</span>
                <span class="px-2 py-1 rounded text-xs" style="background: var(--brand-danger); color: white;">{{ job()!.blockingStatus }}</span>
              </div>
              }
            </div>
          </div>
        </div>
        
        @if (job()!.clientNotes || job()!.productionNotes) {
        <div class="mb-6">
          <h3 class="font-medium mb-3" style="color: var(--text-primary);">Notes</h3>
          @if (job()!.clientNotes) {
          <div class="mb-2">
            <span class="text-xs font-medium" style="color: var(--text-muted);">CLIENT:</span>
            <p class="text-sm mt-1" style="color: var(--text-secondary);">{{ job()!.clientNotes }}</p>
          </div>
          }
          @if (job()!.productionNotes) {
          <div>
            <span class="text-xs font-medium" style="color: var(--text-muted);">PRODUCTION:</span>
            <p class="text-sm mt-1" style="color: var(--text-secondary);">{{ job()!.productionNotes }}</p>
          </div>
          }
        </div>
        }
        
        <div class="flex justify-end gap-3">
          <button 
            class="px-4 py-2 rounded-lg transition-all"
            style="background: var(--surface-elevated); border: 1px solid var(--border-medium); color: var(--text-secondary);"
            (click)="close.emit()">
            Close
          </button>
          <a 
            [routerLink]="['/admin/jobs', job()!.id]"
            class="px-4 py-2 rounded-lg transition-all inline-flex items-center"
            style="background: var(--brand-primary); color: white; text-decoration: none;"
            (click)="close.emit()">
            View Full Details
          </a>
        </div>
      </div>
    </div>
  </div>
}
  `
})
export class JobQuickview {
  readonly open = input<boolean>(false);
  readonly job = input<Job | null>(null);
  
  readonly close = output<void>();
}
