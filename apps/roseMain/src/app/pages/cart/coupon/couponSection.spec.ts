import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CouponSection } from './couponSection';

describe('CouponSection', () => {
  let component: CouponSection;
  let fixture: ComponentFixture<CouponSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponSection],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
