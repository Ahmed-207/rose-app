import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressCard } from './address-card';

describe('AddressCard', () => {
  let component: AddressCard;
  let fixture: ComponentFixture<AddressCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
