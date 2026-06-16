import {ChangeDetectionStrategy,Component, EventEmitter,Input,Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
@Component({
  selector: 'lib-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'md';
  /** Use `submit` only with form `(ngSubmit)` — never combine with `(clicked)`. */
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() ariaLabel?: string;
  @Output() clicked = new EventEmitter<void>();

  get buttonClass(): string {
    return ['btn', `btn-${this.variant}`, this.size !== 'md' ? `btn-${this.size}` : '']
      .filter(Boolean).join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.buttonType === 'submit') {
      return;
    }

    event.preventDefault();
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
