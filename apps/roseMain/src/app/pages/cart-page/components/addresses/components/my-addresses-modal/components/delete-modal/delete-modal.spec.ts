import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { DeleteModal } from './delete-modal';

describe('DeleteModal', () => {
  let component: DeleteModal;
  let fixture: ComponentFixture<DeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteModal],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('deletionId', 'addr-1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
