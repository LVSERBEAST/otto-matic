import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly showLogoStage = signal(false);
  readonly showEnterButton = signal(false);
  readonly enter = output<boolean>();

  enterSite() {
    this.enter.emit(true);
  }
}
