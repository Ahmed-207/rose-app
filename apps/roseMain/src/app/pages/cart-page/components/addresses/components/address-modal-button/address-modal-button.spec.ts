import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AddressModalButton } from './address-modal-button';

describe('AddressModalButton', () => {
  let component: AddressModalButton;
  let fixture: ComponentFixture<AddressModalButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressModalButton],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressModalButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
