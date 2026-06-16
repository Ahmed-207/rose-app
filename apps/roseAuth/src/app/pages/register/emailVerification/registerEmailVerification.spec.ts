import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterEmailVerification } from './registerEmailVerification';

describe('RegisterEmailVerification', () => {
  let component: RegisterEmailVerification;
  let fixture: ComponentFixture<RegisterEmailVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterEmailVerification],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterEmailVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
