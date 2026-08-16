import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FeatureServiceSection } from './featureServiceSection';

describe('FeatureServiceSection', () => {
  let component: FeatureServiceSection;
  let fixture: ComponentFixture<FeatureServiceSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureServiceSection],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureServiceSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
