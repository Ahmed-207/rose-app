import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonListComponent } from './skeleton-list';

describe('SkeletonListComponent', () => {
  let fixture: ComponentFixture<SkeletonListComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonListComponent);
    fixture.componentRef.setInput('rows', 3);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the requested number of rows', () => {
    expect(element.querySelectorAll('.skeleton-list-row').length).toBe(3);
  });
});
