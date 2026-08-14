import { HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AppToastService } from './app-toast.service';
import { SKIP_ERROR_TOAST } from './http-context';
import { toastErrorInterceptor } from './toast-error.interceptor';

describe('toastErrorInterceptor', () => {
  const error = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([toastErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AppToastService, useValue: { error } },
      ],
    });
    error.mockClear();
  });

  it('toasts the backend message on a failed POST', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.post('/api/x', {}).subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).toHaveBeenCalledWith('boom');
  });

  it('does not toast on GET', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.get('/api/x').subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).not.toHaveBeenCalled();
  });

  it('respects SKIP_ERROR_TOAST', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http
      .post('/api/x', {}, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
      .subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).not.toHaveBeenCalled();
  });

  it('falls back to common.REQUEST_FAILED when no message present', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.post('/api/x', {}).subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({}, { status: 400, statusText: 'Bad Request' });

    expect(error).toHaveBeenCalledWith('common.REQUEST_FAILED');
  });
});
