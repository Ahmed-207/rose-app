import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedAuthData } from './shared-auth-data';

describe('SharedAuthData', () => {
  let component: SharedAuthData;
  let fixture: ComponentFixture<SharedAuthData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedAuthData],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedAuthData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
