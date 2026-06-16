import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from './form-control';

describe('FormControl', () => {
  let component: FormControl;
  let fixture: ComponentFixture<FormControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControl],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
