import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificationService } from './notification.service';
import { ApiCallerService } from '../utilities/api-caller-service';

describe('NotificationService', () => {
  let service: NotificationService;
  let apiCallerSpy: {
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiCallerSpy = {
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ApiCallerService, useValue: apiCallerSpy },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET notifications with page, limit, and search params', () => {
    apiCallerSpy.get.mockReturnValue(of({}));

    service.getNotifications(2, 10, 'order').subscribe();

    expect(apiCallerSpy.get).toHaveBeenCalledTimes(1);
    const [endpoint, options] = apiCallerSpy.get.mock.calls[0];
    expect(endpoint).toBe('notifications');
    expect(options.params.get('page')).toBe('2');
    expect(options.params.get('limit')).toBe('10');
    expect(options.params.get('search')).toBe('order');
  });

  it('should call GET notifications/unread-count', () => {
    apiCallerSpy.get.mockReturnValue(of({}));

    service.getUnreadCount().subscribe();

    expect(apiCallerSpy.get).toHaveBeenCalledWith('notifications/unread-count');
  });

  it('should call PATCH notifications/{id}', () => {
    apiCallerSpy.patch.mockReturnValue(of({}));

    service.markAsRead('notification-1').subscribe();

    expect(apiCallerSpy.patch).toHaveBeenCalledWith('notifications/notification-1', {
      isRead: true,
    });
  });

  it('should call PATCH notifications/mark-all-read', () => {
    apiCallerSpy.patch.mockReturnValue(of({}));

    service.markAllAsRead().subscribe();

    expect(apiCallerSpy.patch).toHaveBeenCalledWith('notifications/mark-all-read', {});
  });

  it('should call DELETE notifications/{id}', () => {
    apiCallerSpy.delete.mockReturnValue(of({}));

    service.deleteNotification('notification-1').subscribe();

    expect(apiCallerSpy.delete).toHaveBeenCalledWith('notifications/notification-1');
  });

  it('should call DELETE notifications/clear-all', () => {
    apiCallerSpy.delete.mockReturnValue(of({}));

    service.clearAll().subscribe();

    expect(apiCallerSpy.delete).toHaveBeenCalledWith('notifications/clear-all');
  });
});
