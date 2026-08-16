import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TrustedbySection } from './trustedbySection';

describe('TrustedbySection', () => {
  let component: TrustedbySection;
  let fixture: ComponentFixture<TrustedbySection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustedbySection],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(TrustedbySection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
