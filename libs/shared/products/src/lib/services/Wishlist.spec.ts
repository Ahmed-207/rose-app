import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_URL } from '@org/auth';

import { WishlistService } from './WishlistService';

describe('WishlistService', () => {
  let service: WishlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_URL, useValue: 'https://test.com/api/' },
      ],
    });
    service = TestBed.inject(WishlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
