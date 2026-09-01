export const NOTIFICATIONS = {
  list: 'notifications',
  unreadCount: 'notifications/unread-count',
  markAllRead: 'notifications/mark-all-read',
  clearAll: 'notifications/clear-all',
  pushStatus: 'notifications/push-status',
  byId: (id: string) => `notifications/${id}`,
} as const;
