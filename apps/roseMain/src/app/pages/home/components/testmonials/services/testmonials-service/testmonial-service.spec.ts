import { TestBed } from '@angular/core/testing';

import { TestmonialService } from './testmonial-service';

describe('TestmonialService', () => {
  let service: TestmonialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestmonialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
