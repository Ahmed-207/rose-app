import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatCardComponent } from './stat-card.component';
import { StatCardData } from '../../models/dashboard.models';
import { provideTestTranslate } from '../../../../shared/testing/translate-test.providers';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;
  let component: StatCardComponent;

  const baseData: StatCardData = {
    value: '128',
    label: 'Total Orders',
    icon: 'pi pi-shopping-cart',
    iconBg: 'blue',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
      providers: [provideTestTranslate()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.data = baseData;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the value and label', () => {
    component.data = baseData;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.stat-card__value')?.textContent).toContain('128');
    expect(el.querySelector('.stat-card__label')?.textContent).toContain('Total Orders');
  });

  it('should apply the iconBg-derived classes to the card and icon wrapper', () => {
    component.data = baseData;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.stat-card')?.classList.contains('stat-card__--blue')).toBe(true);
    expect(
      el.querySelector('.stat-card__icon')?.classList.contains('stat-card__icon--blue'),
    ).toBe(true);
  });

  it('should render the configured icon class', () => {
    component.data = baseData;
    fixture.detectChanges();

    const iconEl: HTMLElement = fixture.nativeElement.querySelector('.stat-card__icon i');
    expect(iconEl.className).toContain('pi pi-shopping-cart');
  });

  it('should render a suffix when one is provided', () => {
    component.data = { ...baseData, suffix: '%' };
    fixture.detectChanges();

    const suffixEl = fixture.nativeElement.querySelector('.stat-card__suffix');
    expect(suffixEl?.textContent).toContain('%');
  });

  it('should not render a suffix element when suffix is absent', () => {
    component.data = baseData;
    fixture.detectChanges();

    const suffixEl = fixture.nativeElement.querySelector('.stat-card__suffix');
    expect(suffixEl).toBeNull();
  });

  it('should update the DOM when the data input changes', async () => {
    fixture.componentRef.setInput('data', baseData);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentRef.setInput('data', { ...baseData, value: '256', label: 'Total Revenue' });
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.stat-card__value')?.textContent).toContain('256');
    expect(el.querySelector('.stat-card__label')?.textContent).toContain('Total Revenue');
  });
});
