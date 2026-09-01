import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AdminNotificationService } from '@org/notifications';
import { NotificationsPage } from './notifications';
import { provideTestTranslate } from '../../shared/testing/translate-test.providers';
import { NotificationUserSearchService } from './notification-user-search.service';

const validUserId = 'f2d1d3ee-926d-4c57-b2bd-e1a82918192d';

const mockRecipient = {
  id: validUserId,
  username: 'rose122042',
  email: 'rosetest1788122042@emalupe.com',
};

const mockNotification = {
  id: 'notification-1',
  userId: validUserId,
  title: 'Test',
  message: 'Message',
  type: 'ORDER' as const,
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let adminNotificationService: {
    createNotification: ReturnType<typeof vi.fn>;
    getPushStatus: ReturnType<typeof vi.fn>;
  };
  let userSearchService: {
    searchUsers: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    adminNotificationService = {
      createNotification: vi.fn(),
      getPushStatus: vi.fn(),
    };
    userSearchService = {
      searchUsers: vi.fn(),
    };

    adminNotificationService.getPushStatus.mockReturnValue(
      of({
        pushConfigured: true,
        subscriptionCount: 2,
        unreadCount: 0,
      }),
    );
    userSearchService.searchUsers.mockReturnValue(of([mockRecipient]));

    await TestBed.configureTestingModule({
      imports: [NotificationsPage, TranslatePipe],
      providers: [
        { provide: AdminNotificationService, useValue: adminNotificationService },
        { provide: NotificationUserSearchService, useValue: userSearchService },
        provideTestTranslate(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load push status on init', () => {
    fixture.detectChanges();

    expect(adminNotificationService.getPushStatus).toHaveBeenCalled();
    expect(component.pushStatusMessage()).toBe('ADMIN.NOTIFICATIONS.PUSH_CONFIGURED');
  });

  it('should show push not configured message when push is disabled', () => {
    adminNotificationService.getPushStatus.mockReturnValue(
      of({
        pushConfigured: false,
        subscriptionCount: 0,
        unreadCount: 0,
      }),
    );

    const localFixture = TestBed.createComponent(NotificationsPage);
    localFixture.detectChanges();

    expect(localFixture.componentInstance.pushStatusMessage()).toBe(
      'ADMIN.NOTIFICATIONS.PUSH_NOT_CONFIGURED',
    );
  });

  it('should show push unavailable message on push status error', () => {
    adminNotificationService.getPushStatus.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const localFixture = TestBed.createComponent(NotificationsPage);
    localFixture.detectChanges();

    expect(localFixture.componentInstance.pushStatusMessage()).toBe(
      'ADMIN.NOTIFICATIONS.PUSH_UNAVAILABLE',
    );
  });

  it('should show validation errors when form is invalid', () => {
    component.submit();

    expect(adminNotificationService.createNotification).not.toHaveBeenCalled();
    expect(component.showError('userId')).toBe(true);
    expect(component.showError('title')).toBe(true);
    expect(component.showError('message')).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    component.submit();

    expect(adminNotificationService.createNotification).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should require selecting a customer before submit', () => {
    component.form.patchValue({
      title: 'Test',
      message: 'Message',
      type: 'ORDER',
      link: '',
    });

    component.submit();

    expect(adminNotificationService.createNotification).not.toHaveBeenCalled();
    expect(component.fieldErrorKey('userId')).toBe('ADMIN.NOTIFICATIONS.RECIPIENT_REQUIRED');
  });

  it('should set userId when a search result is selected', () => {
    component.selectUser(mockRecipient);

    expect(component.selectedUser()).toEqual(mockRecipient);
    expect(component.form.controls.userId.value).toBe(validUserId);
  });

  it('should call createNotification on valid submit', () => {
    adminNotificationService.createNotification.mockReturnValue(
      of({ notification: mockNotification }),
    );

    component.selectUser(mockRecipient);
    component.form.patchValue({
      title: 'Test',
      message: 'Message',
      type: 'ORDER',
      link: '',
    });

    component.submit();

    expect(adminNotificationService.createNotification).toHaveBeenCalledWith({
      userId: validUserId,
      title: 'Test',
      message: 'Message',
      type: 'ORDER',
    });
  });

  it('should show success message on 201', () => {
    adminNotificationService.createNotification.mockReturnValue(
      of({ notification: mockNotification }),
    );

    component.selectUser(mockRecipient);
    component.form.patchValue({
      title: 'Test',
      message: 'Message',
      type: 'ORDER',
      link: '',
    });

    component.submit();

    expect(component.successMessage()).toBe('ADMIN.NOTIFICATIONS.SUCCESS');
    expect(component.selectedUser()).toBeNull();
  });

  it('should show API error message on failure', () => {
    adminNotificationService.createNotification.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              status: false,
              code: 400,
              message: 'Validation failed',
              errors: [{ path: 'userId', message: 'Please provide a valid user ID' }],
            },
          }),
      ),
    );

    component.selectUser(mockRecipient);
    component.form.patchValue({
      title: 'Test',
      message: 'Message',
      type: 'ORDER',
      link: '',
    });

    component.submit();

    expect(component.errorMessage()).toBe('Please provide a valid user ID');
  });
});
