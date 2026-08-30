import { Component } from '@angular/core';
import { LucideBellOff } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-empty-state',
  imports: [LucideBellOff, TranslatePipe],
  template: `
    <div class="notification-empty-state">
      <svg lucideBellOff [size]="48" class="notification-empty-state__icon"></svg>
      <p class="notification-empty-state__message">{{ 'notifications.EMPTY' | translate }}</p>
    </div>
  `,
  styles: `
    .notification-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2.5rem 1rem;
      text-align: center;
    }

    .notification-empty-state__icon {
      color: #d1d5db;
    }

    .notification-empty-state__message {
      margin: 0;
      font-size: 0.875rem;
      color: #9ca3af;
    }
  `,
})
export class NotificationEmptyState {}
