import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationStore } from '@org/notifications';
import { Spinner } from '@org/shared-ui-components';
import { ConfirmDialog } from 'apps/shared/components/confirm-dialog/confirmDialog';
import { NotificationEmptyState } from '../../shared/components/notification-modal/components/notification-empty-state/notification-empty-state';
import { NotificationItem } from '../../shared/components/notification-modal/components/notification-item/notification-item';

@Component({
  selector: 'app-notifications-page',
  imports: [
    TranslatePipe,
    Spinner,
    ConfirmDialog,
    NotificationEmptyState,
    NotificationItem,
  ],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
})
export class NotificationsPage implements OnInit {
  private readonly router = inject(Router);

  readonly store = inject(NotificationStore);
  readonly openMenuId = signal<string | null>(null);
  readonly showClearConfirm = signal(false);

  ngOnInit(): void {
    this.store.loadNotifications();
    this.store.refreshUnreadCount();
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

  onOpenNotification(notificationId: string): void {
    this.openMenuId.set(null);
    void this.router.navigate(['/home/notifications', notificationId]);
  }

  @HostListener('document:click', ['$event'])
  closeMenusOnOutsideClick(event: MouseEvent): void {
    if (!this.openMenuId()) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('[data-notification-menu]')) {
      return;
    }

    this.openMenuId.set(null);
  }
}
