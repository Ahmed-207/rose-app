import { Component, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationStore } from '@org/notifications';
import { Spinner } from '@org/shared-ui-components';
import { ConfirmDialog } from 'apps/shared/components/confirm-dialog/confirmDialog';
import { NotificationEmptyState } from './components/notification-empty-state/notification-empty-state';
import { NotificationItem } from './components/notification-item/notification-item';

@Component({
  selector: 'app-notification-modal',
  imports: [
    TranslatePipe,
    Spinner,
    ConfirmDialog,
    NotificationEmptyState,
    NotificationItem,
  ],
  templateUrl: './notification-modal.html',
  styleUrl: './notification-modal.css',
})
export class NotificationModal implements OnInit {
  readonly isOpen = input(false);
  readonly closed = output<void>();

  readonly store = inject(NotificationStore);
  readonly openMenuId = signal<string | null>(null);
  readonly showClearConfirm = signal(false);

  ngOnInit(): void {
    this.store.refreshUnreadCount();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.closePanel();
    }
  }

  get headerTitleKey(): string {
    return this.store.hasNotifications()
      ? 'notifications.TITLE_WITH_COUNT'
      : 'notifications.TITLE';
  }

  openPanel(): void {
    this.openMenuId.set(null);
    this.store.loadNotifications();
    this.store.refreshUnreadCount();
  }

  closePanel(): void {
    this.openMenuId.set(null);
    this.closed.emit();
  }

  onMarkAllAsRead(): void {
    if (!this.store.hasNotifications()) {
      return;
    }
    this.store.markAllAsRead();
  }

  onClearAll(): void {
    if (!this.store.hasNotifications()) {
      return;
    }
    this.showClearConfirm.set(true);
  }

  confirmClearAll(): void {
    this.store.clearAll();
    this.showClearConfirm.set(false);
  }

  cancelClearAll(): void {
    this.showClearConfirm.set(false);
  }

  toggleMenu(notificationId: string): void {
    this.openMenuId.update((current) =>
      current === notificationId ? null : notificationId,
    );
  }

  onMarkAsRead(notificationId: string): void {
    this.store.markAsRead(notificationId);
    this.openMenuId.set(null);
  }

  onDelete(notificationId: string): void {
    this.store.deleteNotification(notificationId);
    this.openMenuId.set(null);
  }

  @HostListener('document:click')
  closeMenusOnOutsideClick(): void {
    if (this.openMenuId()) {
      this.openMenuId.set(null);
    }
  }
}
