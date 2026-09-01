import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ListPanelComponent } from './list-panel.component';
import { ListRowItem } from '../../models/dashboard.models';
import { provideTestTranslate } from '../../../../shared/testing/translate-test.providers';

describe('ListPanelComponent', () => {
  let fixture: ComponentFixture<ListPanelComponent>;
  let component: ListPanelComponent;

  const items = [
    { title: 'Sneakers', subtitle: 'SKU-001', value: '$120', valueTone: 'positive' },
    { title: 'T-Shirt', value: '$20' },
  ] as unknown as ListRowItem[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPanelComponent],
      providers: [provideTestTranslate()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPanelComponent);
    component = fixture.componentInstance;
    component.title = 'Top Selling Products';
  });

  it('should create', () => {
    component.items = items;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default showImage, defaultIcon and maxHeight', () => {
    expect(component.showImage).toBe(false);
    expect(component.defaultIcon).toBe('pi pi-tag');
    expect(component.maxHeight).toBe(268);
  });

  it('should render the title', () => {
    component.items = items;
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('.dash-card__header h3');
    expect(heading.textContent).toContain('Top Selling Products');
  });

  it('should render one row per item', () => {
    component.items = items;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.list-row');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('.list-row__title').textContent).toContain('Sneakers');
    expect(rows[0].querySelector('.list-row__value').textContent).toContain('$120');
  });

  it('should render the subtitle only when the item has one', () => {
    component.items = items;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.list-row');
    expect(rows[0].querySelector('.list-row__subtitle')?.textContent).toContain('SKU-001');
    expect(rows[1].querySelector('.list-row__subtitle')).toBeNull();
  });

  it('should show the empty state and no rows when items is empty', () => {
    component.items = [];
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.list-panel__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('No data yet.');
    expect(fixture.nativeElement.querySelectorAll('.list-row').length).toBe(0);
  });

  it('should not show the empty state when items are present', () => {
    component.items = items;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.list-panel__empty')).toBeNull();
  });

  it('should apply maxHeight as an inline pixel style on the scroll container', () => {
    component.items = items;
    component.maxHeight = 300;
    fixture.detectChanges();

    const scrollEl: HTMLElement = fixture.nativeElement.querySelector('.list-panel__scroll');
    expect(scrollEl.style.maxHeight).toBe('300px');
  });

  describe('toneClass', () => {
    it('should default to neutral when valueTone is not set', () => {
      const item = { title: 'X', value: '1' } as ListRowItem;
      expect(component.toneClass(item)).toBe('list-row__value--neutral');
    });

    it('should reflect a given tone', () => {
      const item = { title: 'X', value: '1', valueTone: 'negative' } as unknown as ListRowItem;
      expect(component.toneClass(item)).toBe('list-row__value--negative');
    });

    it('should be reflected in the rendered class on the row', () => {
      component.items = items;
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.list-row__value');
      expect(rows[0].classList.contains('list-row__value--positive')).toBe(true);
      expect(rows[1].classList.contains('list-row__value--neutral')).toBe(true);
    });
  });
});
