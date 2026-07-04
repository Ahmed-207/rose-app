import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelateProductSection } from './relateProductSection';

describe('RelateProductSection', () => {
  let component: RelateProductSection;
  let fixture: ComponentFixture<RelateProductSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelateProductSection],
    }).compileComponents();

    fixture = TestBed.createComponent(RelateProductSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
