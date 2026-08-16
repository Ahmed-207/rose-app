import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { SpecialGiftSection } from './specialGiftSection';

describe('SpecialGiftSection', () => {
  let component: SpecialGiftSection;
  let fixture: ComponentFixture<SpecialGiftSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialGiftSection],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialGiftSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
