import { Component, input, output } from '@angular/core';
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
}
