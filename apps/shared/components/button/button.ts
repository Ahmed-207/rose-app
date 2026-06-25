import {ChangeDetectionStrategy,Component, EventEmitter,Input,Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonShape = 'default' | 'circle' | 'square';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  @Input() shape?: ButtonShape = 'default';
  @Input() iconOnly = false;
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'md';
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() ariaLabel?: string;
  @Output() clicked = new EventEmitter<void>();


get buttonClass(): string {
  return [
    'btn',
    `btn-${this.variant}`,
    this.size !== 'md' ? `btn-${this.size}` : '',
    this.shape !== 'default' ? `btn-${this.shape}` : '',
    this.iconOnly ? 'btn-icon-only' : ''
  ]
    .filter(Boolean)
    .join(' ');
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
