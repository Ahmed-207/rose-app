import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render a skeleton element with shimmer class', () => {
    expect(element.querySelector('.skeleton')).toBeTruthy();
    expect(element.querySelector('.skeleton-shimmer')).toBeTruthy();
  });

  it('should be hidden from assistive technologies', () => {
    const skeleton = element.querySelector('.skeleton');
    expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
  });
});
