import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GallerySection } from './gallery-section';

describe('GallerySection', () => {
  let component: GallerySection;
  let fixture: ComponentFixture<GallerySection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GallerySection],
    }).compileComponents();

    fixture = TestBed.createComponent(GallerySection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
