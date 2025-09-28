import { Component, signal, output } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
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
