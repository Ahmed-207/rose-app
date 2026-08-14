import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AppToastService } from './app-toast.service';

describe('AppToastService', () => {
  let service: AppToastService;
  const add = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: { add } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });
    service = TestBed.inject(AppToastService);
  });

  it('success() adds a success toast on the app key', () => {
    service.success('Saved');
    expect(add).toHaveBeenCalledWith({ key: 'app', severity: 'success', summary: 'Saved', life: 3500 });
  });

  it('error() adds an error toast', () => {
    service.error('Failed');
    expect(add).toHaveBeenCalledWith({ key: 'app', severity: 'error', summary: 'Failed', life: 3500 });
  });

  it('translates message when it is an i18n key', () => {
    const instant = vi.fn((key: string) => (key === 'auth.LOGIN_SUCCESS' ? 'Logged in!' : key));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: { add } },
        { provide: TranslateService, useValue: { instant } },
      ],
    });
    service = TestBed.inject(AppToastService);
    service.success('auth.LOGIN_SUCCESS');
    expect(add).toHaveBeenCalledWith({ key: 'app', severity: 'success', summary: 'Logged in!', life: 3500 });
  });
});
