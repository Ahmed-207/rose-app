import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestmonialCard } from './testmonial-card';

describe('TestmonialCard', () => {
  let component: TestmonialCard;
  let fixture: ComponentFixture<TestmonialCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestmonialCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TestmonialCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
