// src/app/shared/components/stat-card/stat-card.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'stat-card.html'
})
export class StatCard {
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
}
