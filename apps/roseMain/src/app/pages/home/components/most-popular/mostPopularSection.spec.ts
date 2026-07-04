import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostPopularSection } from './mostPopularSection';

describe('MostPopularSection', () => {
  let component: MostPopularSection;
  let fixture: ComponentFixture<MostPopularSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostPopularSection],
    }).compileComponents();

    fixture = TestBed.createComponent(MostPopularSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
