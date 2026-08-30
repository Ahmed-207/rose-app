import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { API_URL, AuthActions } from '@org/auth';
import { NotificationStore } from '@org/notifications';
import { LangService } from '@org/ui-lang-switcher';
import { signal } from '@angular/core';
import { Navbar } from './navbar';
import { CartService } from '../../../pages/cart-page/services/cart.service';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  const mockNotificationStore = {
    unreadCount: signal(3),
    refreshUnreadCount: vi.fn(),
    loadNotifications: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, TranslatePipe],
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
          provide: AuthActions,
          useValue: { getSession: () => ({ id: 'user-1' }) },
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

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle notification panel on bell click', () => {
    const event = new Event('click');
    vi.spyOn(event, 'stopPropagation');

    component.toggleNotificationPanel(event);

    expect(component.isNotificationPanelOpen()).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should close notification panel on second bell click', () => {
    component.isNotificationPanelOpen.set(true);
    component.toggleNotificationPanel(new Event('click'));
    expect(component.isNotificationPanelOpen()).toBe(false);
  });

  it('should show unread badge when count is greater than zero', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('[aria-label="Notifications"] span');
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('should refresh unread count on init when logged in', () => {
    fixture.detectChanges();
    expect(mockNotificationStore.refreshUnreadCount).toHaveBeenCalled();
  });
});
