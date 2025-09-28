import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly open = input<boolean>(false);
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>('Are you sure you want to continue?');
  readonly confirmText = input<string>('Confirm');
  readonly dangerMode = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
