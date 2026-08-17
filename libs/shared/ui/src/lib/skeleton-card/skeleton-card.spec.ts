import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonCardComponent } from './skeleton-card';

describe('SkeletonCardComponent', () => {
  let fixture: ComponentFixture<SkeletonCardComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonCardComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render image, title, price and button placeholders', () => {
    expect(element.querySelector('.skeleton-card-image')).toBeTruthy();
    expect(element.querySelectorAll('.skeleton-card-text').length).toBeGreaterThanOrEqual(2);
    expect(element.querySelector('.skeleton-card-action')).toBeTruthy();
  });
});
