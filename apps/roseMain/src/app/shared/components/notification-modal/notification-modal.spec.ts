import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { Notification, NotificationStore } from '@org/notifications';
import { signal } from '@angular/core';
import { NotificationModal } from './notification-modal';
import { provideTestTranslate } from '../../testing/translate-test.providers';

const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    title: 'Order shipped',
    message: 'Your order is on the way.',
    type: 'ORDER',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notification-2',
    title: 'Promo',
    message: 'Special offer today.',
    type: 'PROMO',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

function createMockStore(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

describe('NotificationModal', () => {
  let component: NotificationModal;
  let fixture: ComponentFixture<NotificationModal>;
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(async () => {
    mockStore = createMockStore();

    await TestBed.configureTestingModule({
      imports: [NotificationModal, TranslatePipe],
      providers: [{ provide: NotificationStore, useValue: mockStore }, provideTestTranslate()],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render burgundy header with title', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.notification-modal__header');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('notifications.TITLE');
  });

  it('should render empty state when there are no notifications', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('notifications.EMPTY');
  });

  it('should disable bulk actions when empty', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.notification-modal__action');
    buttons.forEach((button: HTMLButtonElement) => {
      expect(button.disabled).toBe(true);
    });
  });

  it('should call markAllAsRead when action is clicked', async () => {
    const populatedStore = createMockStore({
      hasNotifications: signal(true),
      entities: signal(mockNotifications),
      totalResults: signal(2),
    });

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NotificationModal, TranslatePipe],
      providers: [{ provide: NotificationStore, useValue: populatedStore }, provideTestTranslate()],
    }).compileComponents();

    const localFixture = TestBed.createComponent(NotificationModal);
    localFixture.componentRef.setInput('isOpen', true);
    localFixture.detectChanges();

    const markAllButton = Array.from(
      localFixture.nativeElement.querySelectorAll('.notification-modal__action'),
    )[1] as HTMLButtonElement;
    markAllButton.click();

    expect(populatedStore.markAllAsRead).toHaveBeenCalled();
  });

  it('should show confirm dialog before clear all', async () => {
    const populatedStore = createMockStore({
      hasNotifications: signal(true),
      entities: signal(mockNotifications),
    });

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NotificationModal, TranslatePipe],
      providers: [{ provide: NotificationStore, useValue: populatedStore }, provideTestTranslate()],
    }).compileComponents();

    const localFixture = TestBed.createComponent(NotificationModal);
    const localComponent = localFixture.componentInstance;
    localFixture.componentRef.setInput('isOpen', true);
    localFixture.detectChanges();

    const clearButton = localFixture.nativeElement.querySelector(
      '.notification-modal__action--clear',
    ) as HTMLButtonElement;
    clearButton.click();
    localFixture.detectChanges();

    expect(localComponent.showClearConfirm()).toBe(true);
    expect(localFixture.nativeElement.querySelector('app-confirm-dialog')).toBeTruthy();
  });

  it('should call clearAll after confirm', () => {
    component.showClearConfirm.set(true);
    fixture.detectChanges();
    component.confirmClearAll();
    expect(mockStore.clearAll).toHaveBeenCalled();
  });

  it('should keep only one menu open at a time', () => {
    component.toggleMenu('notification-1');
    expect(component.openMenuId()).toBe('notification-1');
    component.toggleMenu('notification-2');
    expect(component.openMenuId()).toBe('notification-2');
  });
});
