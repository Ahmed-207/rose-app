import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { API_URL, AuthActions } from '@org/auth';
import { NotificationStore } from '@org/notifications';
import { LangService } from '@org/ui-lang-switcher';
import { signal } from '@angular/core';
import { SecondryNavbar } from './secondryNavbar';
import { CartService } from '../../../pages/cart-page/services/cart.service';
import { WishlistService } from '@org/products';
import { addressStore } from '@org/user-addresses';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

describe('SecondryNavbar', () => {
  let component: SecondryNavbar;
  let fixture: ComponentFixture<SecondryNavbar>;

  const mockNotificationStore = {
    unreadCount: signal(2),
    isLoading: signal(false),
    error: signal<string | null>(null),
    entities: signal([]),
    totalResults: signal(0),
    hasNotifications: signal(false),
    refreshUnreadCount: vi.fn(),
    loadNotifications: vi.fn(),
    markAllAsRead: vi.fn(),
    clearAll: vi.fn(),
    markAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondryNavbar, TranslatePipe],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTestTranslate(),
        { provide: API_URL, useValue: 'http://localhost/api/' },
        {
          provide: CartService,
          useValue: { itemCount: signal(0), refreshCount: vi.fn() },
        },
        {
          provide: WishlistService,
          useValue: { wishlistCount: signal(0), getLoggedUserWishlist: vi.fn() },
        },
        {
          provide: addressStore,
          useValue: {
            lastSelectedAddressCity: signal('Cairo'),
            loadAddresses: vi.fn(),
          },
        },
        {
          provide: AuthActions,
          useValue: { getSession: () => ({ id: 'user-1' }), logout: vi.fn() },
        },
        {
          provide: LangService,
          useValue: {
            init: vi.fn(),
            currentLang: signal({ name: 'English', code: 'en' }),
            desiredLang: signal({ name: 'العربية', code: 'ar' }),
            changeLang: vi.fn(),
          },
        },
        { provide: NotificationStore, useValue: mockNotificationStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondryNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle notification panel on bell click', () => {
    component.toggleNotificationPanel(new Event('click'));
    expect(component.isNotificationPanelOpen()).toBe(true);
  });

  it('should render notification dropdown inside relative wrapper', () => {
    component.isNotificationPanelOpen.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.relative app-notification-modal')).toBeTruthy();
  });

  it('should refresh unread count on init', () => {
    fixture.detectChanges();
    expect(mockNotificationStore.refreshUnreadCount).toHaveBeenCalled();
  });
});
