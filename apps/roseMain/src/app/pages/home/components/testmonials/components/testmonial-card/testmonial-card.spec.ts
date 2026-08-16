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
    fixture.componentRef.setInput('tCreatedAt', '2024-01-01');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
