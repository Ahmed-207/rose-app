import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationStore } from '@org/notifications';
import { Spinner } from '@org/shared-ui-components';

@Component({
  selector: 'app-notification-detail-page',
  imports: [DatePipe, RouterLink, TranslatePipe, Spinner],
  templateUrl: './notification-detail-page.html',
  styleUrl: './notification-detail-page.css',
})
export class NotificationDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly store = inject(NotificationStore);
  readonly notificationId = computed(
    () => this.route.snapshot.paramMap.get('id') ?? '',
  );
  readonly notification = computed(
    () => this.store.entityMap()[this.notificationId()] ?? null,
  );

  constructor() {
    effect(() => {
      const current = this.notification();
      if (current && !current.isRead) {
        this.store.markAsRead(current.id);
      }
    });
  }

  ngOnInit(): void {
    this.store.loadNotifications();
    this.store.refreshUnreadCount();
  }

  onDelete(): void {
    const current = this.notification();
    if (!current) {
      return;
    }

    this.store.deleteNotification(current.id);
    void this.router.navigate(['/home/notifications']);
  }

  openLink(): void {
    const link = this.notification()?.link;
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }
}
