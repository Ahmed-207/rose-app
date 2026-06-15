import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyOtp } from './verifyOtp';

describe('VerifyOtp', () => {
  let component: VerifyOtp;
  let fixture: ComponentFixture<VerifyOtp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyOtp],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyOtp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
