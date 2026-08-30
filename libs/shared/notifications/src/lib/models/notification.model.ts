export type NotificationType = 'ORDER' | 'PROMO' | 'SYSTEM';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface Metadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetNotificationsPayload {
  data: Notification[];
  metadata: Metadata;
}

export interface GetNotificationsRes {
  status: boolean;
  code: number;
  payload: GetNotificationsPayload;
}

export interface UnreadCountPayload {
  unreadCount: number;
}

export interface UnreadCountRes {
  status: boolean;
  code: number;
  payload: UnreadCountPayload;
}

export interface NotificationMutationRes {
  status: boolean;
  code: number;
  message?: string;
  payload?: Notification;
}

export interface CreateNotificationReq {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface CreateNotificationRes {
  status: boolean;
  code: number;
  payload: {
    notification: Notification;
  };
}

export interface PushStatusPayload {
  pushConfigured: boolean;
  subscriptionCount: number;
  unreadCount?: number;
}

export interface PushStatusRes {
  status: boolean;
  code: number;
  payload: PushStatusPayload;
}
