import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_URL } from '@org/auth';

import { CouponsService } from './coupon-service';

describe('CouponsService', () => {
  let service: CouponsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_URL, useValue: 'https://test.com/api/' },
      ],
    });
    service = TestBed.inject(CouponsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
