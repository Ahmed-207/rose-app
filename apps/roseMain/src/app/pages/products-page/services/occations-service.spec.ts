import { TestBed } from '@angular/core/testing';

import { OccationsService } from './occations-service';

describe('OccationsService', () => {
  let service: OccationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OccationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
