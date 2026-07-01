import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecialGiftSection } from './specialGiftSection';

describe('SpecialGiftSection', () => {
  let component: SpecialGiftSection;
  let fixture: ComponentFixture<SpecialGiftSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialGiftSection],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialGiftSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
