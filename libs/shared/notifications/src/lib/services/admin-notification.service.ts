import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateNotificationPayload,
  CreateNotificationReq,
  PushStatusPayload,
} from '../models/notification.model';
import { NOTIFICATIONS } from '../utilities/api-endpoints';
import { ApiCallerService } from '../utilities/api-caller-service';

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationService {
  private readonly api = inject(ApiCallerService);

  createNotification(body: CreateNotificationReq): Observable<CreateNotificationPayload> {
    return this.api.post<CreateNotificationPayload>(NOTIFICATIONS.list, body);
  }

  getPushStatus(): Observable<PushStatusPayload> {
    return this.api.get<PushStatusPayload>(NOTIFICATIONS.pushStatus);
  }
}
