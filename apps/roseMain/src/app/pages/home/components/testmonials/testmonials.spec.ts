import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Testmonials } from './testmonials';

describe('Testmonials', () => {
  let component: Testmonials;
  let fixture: ComponentFixture<Testmonials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testmonials],
    }).compileComponents();

    fixture = TestBed.createComponent(Testmonials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
