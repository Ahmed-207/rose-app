import { ChangeDetectionStrategy,Component,EventEmitter,Input,Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type MessageType = 'error' | 'warning' | 'success' | 'info';

const ICON_MAP: Record<MessageType, string> = {
  error: 'ti-circle-x',
  warning: 'ti-alert-triangle',
  success: 'ti-circle-check',
  info: 'ti-info-circle',
};
@Component({
  selector: 'lib-message',
  imports: [CommonModule],
  templateUrl: './message.html',
  styleUrl: './message.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Message {
   @Input() type: MessageType = 'error';
  @Input() title?: string;
  @Input() inline = false;

  @Output() dismissed = new EventEmitter<void>();

  get icon(): string {
    return ICON_MAP[this.type];
  }

  get hasDismiss(): boolean {
    return this.dismissed.observed;
  }
}
