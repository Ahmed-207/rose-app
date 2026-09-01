import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Notification, NotificationStore } from '@org/notifications';
import { signal } from '@angular/core';
import { NotificationsPage } from './notifications-page';
import { provideTestTranslate } from '../../shared/testing/translate-test.providers';

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let mockStore: {
    isLoading: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    entities: ReturnType<typeof signal<Notification[]>>;
    totalResults: ReturnType<typeof signal>;
    hasNotifications: ReturnType<typeof signal>;
    loadNotifications: ReturnType<typeof vi.fn>;
    refreshUnreadCount: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
    clearAll: ReturnType<typeof vi.fn>;
    markAsRead: ReturnType<typeof vi.fn>;
    deleteNotification: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockStore = {
      isLoading: signal(false),
      error: signal<string | null>(null),
      entities: signal<Notification[]>([]),
      totalResults: signal(0),
      hasNotifications: signal(false),
      loadNotifications: vi.fn(),
      refreshUnreadCount: vi.fn(),
      markAllAsRead: vi.fn(),
      clearAll: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationsPage, TranslatePipe],
      providers: [
        provideRouter([]),
        { provide: NotificationStore, useValue: mockStore },
        provideTestTranslate(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;
  });

  it('should create and load notifications on init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(mockStore.loadNotifications).toHaveBeenCalled();
    expect(mockStore.refreshUnreadCount).toHaveBeenCalled();
  });
});
