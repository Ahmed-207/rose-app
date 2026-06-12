import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LabelVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'purple';

@Component({
  selector: 'lib-label',
 imports: [CommonModule],
  templateUrl: './label.html',
  styleUrl: './label.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Label {
   @Input() variant: LabelVariant = 'default';
  @Input() dot = false;

  get labelClass(): string {
    return `label-${this.variant}`;
  }
}
