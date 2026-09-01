export type NotificationType = 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'REVIEW' | 'OTHER';

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
  updatedAt?: string;
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

export interface UnreadCountPayload {
  unreadCount: number;
}

export interface NotificationMutationPayload {
  notification?: Notification;
}

export interface CreateNotificationReq {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export interface CreateNotificationPayload {
  notification: Notification;
}

export interface PushStatusPayload {
  pushConfigured: boolean;
  subscriptionCount: number;
  unreadCount?: number;
}

/** @deprecated Use payload types returned by services after API unwrap. */
export interface GetNotificationsRes {
  status: boolean;
  code: number;
  payload: GetNotificationsPayload;
}

/** @deprecated Use UnreadCountPayload. */
export interface UnreadCountRes {
  status: boolean;
  code: number;
  payload: UnreadCountPayload;
}

/** @deprecated Use NotificationMutationPayload. */
export interface NotificationMutationRes {
  status: boolean;
  code: number;
  message?: string;
  payload?: NotificationMutationPayload;
}

/** @deprecated Use CreateNotificationPayload. */
export interface CreateNotificationRes {
  status: boolean;
  code: number;
  payload: CreateNotificationPayload;
}

/** @deprecated Use PushStatusPayload. */
export interface PushStatusRes {
  status: boolean;
  code: number;
  payload: PushStatusPayload;
}
