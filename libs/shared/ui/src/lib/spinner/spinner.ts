
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'default' | 'primary' | 'danger' | 'success';
@Component({
  selector: 'lib-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  @Input() size: SpinnerSize = 'md';
  @Input() color: SpinnerColor = 'default';
  @Input() overlay = false;
  @Input() label?: string;

  get spinnerClass(): string {
    return [
      'spinner',
      `spinner-${this.size}`,
      this.color !== 'default' ? `spinner-${this.color}` : '',
    ].filter(Boolean).join(' ');
  }
}
