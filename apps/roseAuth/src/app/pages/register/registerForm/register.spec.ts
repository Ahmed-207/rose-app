import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink, withComponentInputBinding } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { provideAuth } from '@org/auth';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register, RouterLink],
      providers: [
        provideAuth({ apiUrl: 'https://test.com/api/' }),
        provideTranslateService(),
        provideRouter([], withComponentInputBinding()),
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
