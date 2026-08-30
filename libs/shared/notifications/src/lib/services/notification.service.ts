import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GetNotificationsRes,
  NotificationMutationRes,
  UnreadCountRes,
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
  ): Observable<GetNotificationsRes> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.api.get<GetNotificationsRes>(NOTIFICATIONS.list, { params });
  }

  getUnreadCount(): Observable<UnreadCountRes> {
    return this.api.get<UnreadCountRes>(NOTIFICATIONS.unreadCount);
  }

  markAsRead(id: string): Observable<NotificationMutationRes> {
    return this.api.patch<NotificationMutationRes>(NOTIFICATIONS.byId(id), {
      isRead: true,
    });
  }

  markAllAsRead(): Observable<NotificationMutationRes> {
    return this.api.patch<NotificationMutationRes>(NOTIFICATIONS.markAllRead, {});
  }

  deleteNotification(id: string): Observable<NotificationMutationRes> {
    return this.api.delete<NotificationMutationRes>(NOTIFICATIONS.byId(id));
  }

  clearAll(): Observable<NotificationMutationRes> {
    return this.api.delete<NotificationMutationRes>(NOTIFICATIONS.clearAll);
  }
}
