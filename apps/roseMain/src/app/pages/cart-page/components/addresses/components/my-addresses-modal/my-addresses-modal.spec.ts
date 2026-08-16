import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { MyAddressesModal } from './my-addresses-modal';

describe('MyAddressesModal', () => {
  let component: MyAddressesModal;
  let fixture: ComponentFixture<MyAddressesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAddressesModal],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAddressesModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
