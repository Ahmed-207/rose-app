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
    fixture.componentRef.setInput('cardCity', 'Cairo');
    fixture.componentRef.setInput('cardStreet', 'Main St');
    fixture.componentRef.setInput('cardPhone', '01000000000');
    fixture.componentRef.setInput('isMainAddress', true);
    fixture.componentRef.setInput('cardTitle', 'Home');
    fixture.componentRef.setInput('addressId', 'addr-1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
