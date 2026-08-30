import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NotificationStore } from './notification.store';
import { NotificationService } from '../services/notification.service';
import { GetNotificationsRes, Notification, UnreadCountRes } from '../models/notification.model';

const mockNotification: Notification = {
  id: 'notification-1',
  title: 'Order shipped',
  message: 'Your order is on the way.',
  type: 'ORDER',
  isRead: false,
  createdAt: new Date().toISOString(),
};

const mockReadNotification: Notification = {
  ...mockNotification,
  id: 'notification-2',
  isRead: true,
};

class MockNotificationService {
  getNotifications = vi.fn();
  getUnreadCount = vi.fn();
  markAsRead = vi.fn();
  markAllAsRead = vi.fn();
  deleteNotification = vi.fn();
  clearAll = vi.fn();
}

class MockToastrService {
  error = vi.fn();
}

describe('NotificationStore', () => {
  let store: InstanceType<typeof NotificationStore>;
  let notificationService: MockNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: ToastrService, useClass: MockToastrService },
        NotificationStore,
      ],
    });

    store = TestBed.inject(NotificationStore);
    notificationService = TestBed.inject(
      NotificationService,
    ) as unknown as MockNotificationService;
  });

  describe('loadNotifications', () => {
    it('should set entities and totalResults on success', async () => {
      const res: GetNotificationsRes = {
        status: true,
        code: 200,
        payload: {
          data: [mockNotification],
          metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      };
      notificationService.getNotifications.mockReturnValue(of(res));

      store.loadNotifications();

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(1);
        expect(store.totalResults()).toBe(1);
        expect(store.isLoading()).toBe(false);
      });
    });

    it('should set error on failure', async () => {
      notificationService.getNotifications.mockReturnValue(
        throwError(() => ({ message: 'Load failed' })),
      );

      store.loadNotifications();

      await vi.waitFor(() => {
        expect(store.error()).toBe('Load failed');
        expect(store.isLoading()).toBe(false);
      });
    });
  });

  describe('refreshUnreadCount', () => {
    it('should update unreadCount signal', async () => {
      const res: UnreadCountRes = {
        status: true,
        code: 200,
        payload: { unreadCount: 3 },
      };
      notificationService.getUnreadCount.mockReturnValue(of(res));

      store.refreshUnreadCount();

      await vi.waitFor(() => {
        expect(store.unreadCount()).toBe(3);
      });
    });
  });

  describe('markAsRead', () => {
    it('should update entity and decrement unreadCount', async () => {
      notificationService.getNotifications.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockNotification],
            metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
          },
        }),
      );
      notificationService.getUnreadCount.mockReturnValue(
        of({ status: true, code: 200, payload: { unreadCount: 1 } }),
      );
      notificationService.markAsRead.mockReturnValue(of({ status: true, code: 200 }));

      store.loadNotifications();
      store.refreshUnreadCount();

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(1);
      });

      store.markAsRead('notification-1');

      await vi.waitFor(() => {
        expect(store.entityMap()['notification-1']?.isRead).toBe(true);
        expect(store.unreadCount()).toBe(0);
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all entities as read and reset unreadCount', async () => {
      notificationService.getNotifications.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockNotification, { ...mockReadNotification, id: 'notification-3', isRead: false }],
            metadata: { page: 1, limit: 20, total: 2, totalPages: 1 },
          },
        }),
      );
      notificationService.markAllAsRead.mockReturnValue(of({ status: true, code: 200 }));

      store.loadNotifications();

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(2);
      });

      store.markAllAsRead();

      await vi.waitFor(() => {
        expect(store.entities().every((item) => item.isRead)).toBe(true);
        expect(store.unreadCount()).toBe(0);
      });
    });
  });

  describe('deleteNotification', () => {
    it('should remove entity from store', async () => {
      notificationService.getNotifications.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockNotification],
            metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
          },
        }),
      );
      notificationService.deleteNotification.mockReturnValue(of({ status: true, code: 200 }));

      store.loadNotifications();

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(1);
      });

      store.deleteNotification('notification-1');

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(0);
        expect(store.totalResults()).toBe(0);
      });
    });

    it('should decrement unreadCount when deleting an unread notification', async () => {
      notificationService.getNotifications.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockNotification],
            metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
          },
        }),
      );
      notificationService.getUnreadCount.mockReturnValue(
        of({ status: true, code: 200, payload: { unreadCount: 1 } }),
      );
      notificationService.deleteNotification.mockReturnValue(of({ status: true, code: 200 }));

      store.loadNotifications();
      store.refreshUnreadCount();

      await vi.waitFor(() => {
        expect(store.unreadCount()).toBe(1);
      });

      store.deleteNotification('notification-1');

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(0);
        expect(store.unreadCount()).toBe(0);
      });
    });
  });

  describe('clearAll', () => {
    it('should clear all entities', async () => {
      notificationService.getNotifications.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockNotification, mockReadNotification],
            metadata: { page: 2, limit: 20, total: 2, totalPages: 1 },
          },
        }),
      );
      notificationService.clearAll.mockReturnValue(of({ status: true, code: 200 }));

      store.loadNotifications();

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(2);
      });

      store.clearAll();

      await vi.waitFor(() => {
        expect(store.entities()).toHaveLength(0);
        expect(store.unreadCount()).toBe(0);
      });
    });
  });
});
