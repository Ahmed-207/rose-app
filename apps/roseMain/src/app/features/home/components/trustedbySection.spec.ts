import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrustedbySection } from './trustedbySection';

describe('TrustedbySection', () => {
  let component: TrustedbySection;
  let fixture: ComponentFixture<TrustedbySection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustedbySection],
    }).compileComponents();

    fixture = TestBed.createComponent(TrustedbySection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
