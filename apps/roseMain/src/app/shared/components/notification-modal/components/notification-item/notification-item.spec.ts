import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { Notification, NotificationStore } from '@org/notifications';
import { NotificationItem } from './notification-item';
import { provideTestTranslate } from '../../../../testing/translate-test.providers';

const mockNotification: Notification = {
  id: 'notification-1',
  title: 'Order shipped',
  message: 'Your order is on the way.',
  type: 'ORDER',
  isRead: false,
  createdAt: new Date().toISOString(),
};

describe('NotificationItem', () => {
  let component: NotificationItem;
  let fixture: ComponentFixture<NotificationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationItem, TranslatePipe],
      providers: [{ provide: NotificationStore, useValue: {} }, provideTestTranslate()],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('notification', mockNotification);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply unread styling', () => {
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.notification-item');
    expect(row.classList.contains('notification-item--unread')).toBe(true);
  });

  it('should apply read styling', () => {
    fixture.componentRef.setInput('notification', { ...mockNotification, isRead: true });
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.notification-item');
    expect(row.classList.contains('notification-item--read')).toBe(true);
  });

  it('should emit openNotification when content is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.openNotification, 'emit');
    const content = fixture.nativeElement.querySelector('.notification-item__content');
    content.click();
    expect(spy).toHaveBeenCalledWith('notification-1');
  });

  it('should emit menu toggle on ellipsis click', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.menuToggle, 'emit');
    const button = fixture.nativeElement.querySelector('.notification-item__menu-trigger');
    button.click();
    expect(spy).toHaveBeenCalledWith('notification-1');
  });

  it('should emit markAsRead for unread notifications', () => {
    fixture.componentRef.setInput('isMenuOpen', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.markAsRead, 'emit');
    const markReadButton = fixture.nativeElement.querySelector(
      '.notification-item__menu-item:not(.notification-item__menu-item--danger)',
    ) as HTMLButtonElement;
    markReadButton.click();

    expect(spy).toHaveBeenCalledWith('notification-1');
  });

  it('should not emit markAsRead when notification is already read', () => {
    fixture.componentRef.setInput('notification', { ...mockNotification, isRead: true });
    fixture.componentRef.setInput('isMenuOpen', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.markAsRead, 'emit');
    const markReadButton = fixture.nativeElement.querySelector(
      '.notification-item__menu-item:not(.notification-item__menu-item--danger)',
    ) as HTMLButtonElement;
    markReadButton.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit deleteNotification when delete is clicked', () => {
    fixture.componentRef.setInput('isMenuOpen', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.deleteNotification, 'emit');
    const deleteButton = fixture.nativeElement.querySelector(
      '.notification-item__menu-item--danger',
    ) as HTMLButtonElement;
    deleteButton.click();

    expect(spy).toHaveBeenCalledWith('notification-1');
  });
});
