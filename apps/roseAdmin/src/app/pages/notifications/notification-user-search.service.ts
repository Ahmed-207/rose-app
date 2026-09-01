import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL, ApiResponse } from '@org/auth';
import { map, Observable } from 'rxjs';

export interface NotificationRecipient {
  id: string;
  username: string;
  email: string;
}

interface OrderUser {
  id: string;
  username: string;
  email: string;
}

interface OrderSearchItem {
  user?: OrderUser;
}

interface OrderSearchPayload {
  data: OrderSearchItem[];
}

@Injectable({
  providedIn: 'root',
})
export class NotificationUserSearchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  searchUsers(query: string): Observable<NotificationRecipient[]> {
    const trimmed = query.trim();
    const params = new HttpParams()
      .set('search', trimmed)
      .set('page', '1')
      .set('limit', '20');

    return this.http
      .get<ApiResponse<OrderSearchPayload>>(`${this.apiUrl}orders`, { params })
      .pipe(map((response) => dedupeRecipients(response.payload?.data ?? [])));
  }
}

export function dedupeRecipients(orders: OrderSearchItem[]): NotificationRecipient[] {
  const recipients = new Map<string, NotificationRecipient>();

  for (const order of orders) {
    const user = order.user;
    if (!user?.id) {
      continue;
    }

    recipients.set(user.id, {
      id: user.id,
      username: user.username,
      email: user.email,
    });
  }

  return Array.from(recipients.values());
}
