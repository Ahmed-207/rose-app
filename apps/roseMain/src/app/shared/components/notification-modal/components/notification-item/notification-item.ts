import {
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Notification } from '@org/notifications';

@Component({
  selector: 'app-notification-item',
  imports: [TranslatePipe],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.css',
})
export class NotificationItem {
  readonly notification = input.required<Notification>();
  readonly isMenuOpen = input(false);

  readonly menuToggle = output<string>();
  readonly markAsRead = output<string>();
  readonly deleteNotification = output<string>();
  readonly openNotification = output<string>();

  private readonly menuTrigger = viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');
  readonly menuStyle = signal<{ top: string; left: string } | null>(null);

  constructor() {
    effect(() => {
      if (!this.isMenuOpen()) {
        this.menuStyle.set(null);
        return;
      }

      const trigger = this.menuTrigger()?.nativeElement;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const menuWidth = 176;
      const menuHeight = 88;
      const margin = 8;

      let top = rect.bottom + 4;
      let left = rect.right - menuWidth;

      if (top + menuHeight > window.innerHeight - margin) {
        top = rect.top - menuHeight - 4;
      }

      if (left < margin) {
        left = margin;
      }

      if (left + menuWidth > window.innerWidth - margin) {
        left = window.innerWidth - menuWidth - margin;
      }

      this.menuStyle.set({
        top: `${Math.max(margin, top)}px`,
        left: `${Math.max(margin, left)}px`,
      });
    });
  }

  onOpen(event: Event): void {
    event.stopPropagation();
    this.openNotification.emit(this.notification().id);
  }

  onMenuToggle(event: Event): void {
    event.stopPropagation();
    this.menuToggle.emit(this.notification().id);
  }

  onMarkAsRead(event: Event): void {
    event.stopPropagation();
    if (!this.notification().isRead) {
      this.markAsRead.emit(this.notification().id);
    }
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.deleteNotification.emit(this.notification().id);
  }

  onMenuContainerClick(event: Event): void {
    event.stopPropagation();
  }
}
