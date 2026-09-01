import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateNotificationPayload,
  GetNotificationsPayload,
  NotificationMutationPayload,
  PushStatusPayload,
  UnreadCountPayload,
} from '../models/notification.model';
import { NOTIFICATIONS } from '../utilities/api-endpoints';
import { ApiCallerService } from '../utilities/api-caller-service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly api = inject(ApiCallerService);

  getNotifications(
    page = 1,
    limit = 20,
    search?: string,
  ): Observable<GetNotificationsPayload> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.api.get<GetNotificationsPayload>(NOTIFICATIONS.list, { params });
  }

  getUnreadCount(): Observable<UnreadCountPayload> {
    return this.api.get<UnreadCountPayload>(NOTIFICATIONS.unreadCount);
  }

  markAsRead(id: string): Observable<NotificationMutationPayload> {
    return this.api.patch<NotificationMutationPayload>(NOTIFICATIONS.byId(id), {
      isRead: true,
    });
  }

  markAllAsRead(): Observable<NotificationMutationPayload> {
    return this.api.patch<NotificationMutationPayload>(NOTIFICATIONS.markAllRead, {});
  }

  deleteNotification(id: string): Observable<NotificationMutationPayload> {
    return this.api.delete<NotificationMutationPayload>(NOTIFICATIONS.byId(id));
  }

  clearAll(): Observable<NotificationMutationPayload> {
    return this.api.delete<NotificationMutationPayload>(NOTIFICATIONS.clearAll);
  }
}
