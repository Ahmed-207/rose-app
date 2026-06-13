import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'flat' | 'accent' | 'metric';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-card',
  imports: [CommonModule],
  templateUrl: './card.html',
   changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './card.css',
})
export class Card {
   @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: CardVariant = 'default';
  @Input() footer = false;
  @Input() padding: CardPadding = 'md';

  get cardClass(): string {
    return `card-${this.variant}`;
  }

  get bodyClass(): string {
    return `body-${this.padding}`;
  }
}
