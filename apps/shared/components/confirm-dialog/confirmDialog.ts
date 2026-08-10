import { Component, input, output } from '@angular/core';
import { LucideTrash2, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-confirm-dialog',
  imports: [LucideX, LucideTrash2],
  templateUrl: './confirmDialog.html',
  styleUrl: './confirmDialog.css',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input('');
  readonly confirmLabel = input.required<string>();
  readonly cancelLabel = input.required<string>();
  readonly loading = input(false);
  readonly destructive = input(true);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    if (this.loading()) {
      return;
    }
    this.confirmed.emit();
  }

  onCancel(): void {
    if (this.loading()) {
      return;
    }
    this.cancelled.emit();
  }
}
