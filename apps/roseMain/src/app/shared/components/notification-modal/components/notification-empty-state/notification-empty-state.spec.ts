import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationEmptyState } from './notification-empty-state';
import { provideTestTranslate } from '../../../../testing/translate-test.providers';

describe('NotificationEmptyState', () => {
  let fixture: ComponentFixture<NotificationEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationEmptyState, TranslatePipe],
      providers: [provideTestTranslate()],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationEmptyState);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render empty state message', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('notifications.EMPTY');
  });
});
