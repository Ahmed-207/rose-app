import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminNotificationService } from './admin-notification.service';
import { ApiCallerService } from '../utilities/api-caller-service';
import { CreateNotificationReq } from '../models/notification.model';

describe('AdminNotificationService', () => {
  let service: AdminNotificationService;
  let apiCallerSpy: {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiCallerSpy = {
      post: vi.fn(),
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminNotificationService,
        { provide: ApiCallerService, useValue: apiCallerSpy },
      ],
    });

    service = TestBed.inject(AdminNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST notifications with request body', () => {
    apiCallerSpy.post.mockReturnValue(of({}));

    const body: CreateNotificationReq = {
      userId: 'user-1',
      title: 'Order shipped',
      message: 'Your order is on the way.',
      type: 'ORDER',
    };

    service.createNotification(body).subscribe();

    expect(apiCallerSpy.post).toHaveBeenCalledWith('notifications', body);
  });

  it('should call GET notifications/push-status', () => {
    apiCallerSpy.get.mockReturnValue(of({}));

    service.getPushStatus().subscribe();

    expect(apiCallerSpy.get).toHaveBeenCalledWith('notifications/push-status');
  });
});
