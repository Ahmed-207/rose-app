import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BestSellingSection } from './bestSellingSection';

describe('BestSellingSection', () => {
  let component: BestSellingSection;
  let fixture: ComponentFixture<BestSellingSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestSellingSection],
    }).compileComponents();

    fixture = TestBed.createComponent(BestSellingSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
