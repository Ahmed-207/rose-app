import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateNotificationReq,
  CreateNotificationRes,
  PushStatusRes,
} from '../models/notification.model';
import { NOTIFICATIONS } from '../utilities/api-endpoints';
import { ApiCallerService } from '../utilities/api-caller-service';

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationService {
  private readonly api = inject(ApiCallerService);

  createNotification(body: CreateNotificationReq): Observable<CreateNotificationRes> {
    return this.api.post<CreateNotificationRes>(NOTIFICATIONS.list, body);
  }

  getPushStatus(): Observable<PushStatusRes> {
    return this.api.get<PushStatusRes>(NOTIFICATIONS.pushStatus);
  }
}
