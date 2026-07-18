import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAddressesModal } from './my-addresses-modal';

describe('MyAddressesModal', () => {
  let component: MyAddressesModal;
  let fixture: ComponentFixture<MyAddressesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAddressesModal],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAddressesModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
