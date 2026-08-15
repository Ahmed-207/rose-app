import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginator } from './paginator';

describe('Paginator', () => {
  let component: Paginator;
  let fixture: ComponentFixture<Paginator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paginator],
    }).compileComponents();

    fixture = TestBed.createComponent(Paginator);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pFirst', 0);
    fixture.componentRef.setInput('pItemsPerPage', 12);
    fixture.componentRef.setInput('pTotalItems', 60);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit page index on page change', () => {
    const emitted: number[] = [];
    component.pPageChange.subscribe((page) => emitted.push(page));

    component.onPageChange({ page: 2, first: 24, rows: 12, pageCount: 5 });

    expect(emitted).toEqual([2]);
  });
});
