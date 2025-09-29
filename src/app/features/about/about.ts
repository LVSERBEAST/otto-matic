import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
