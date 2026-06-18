import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondryNavbar } from './secondryNavbar';

describe('SecondryNavbar', () => {
  let component: SecondryNavbar;
  let fixture: ComponentFixture<SecondryNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondryNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondryNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
