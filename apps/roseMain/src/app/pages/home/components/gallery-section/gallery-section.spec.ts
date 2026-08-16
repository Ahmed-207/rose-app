import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { GallerySection } from './gallery-section';

describe('GallerySection', () => {
  let component: GallerySection;
  let fixture: ComponentFixture<GallerySection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GallerySection],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(GallerySection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
