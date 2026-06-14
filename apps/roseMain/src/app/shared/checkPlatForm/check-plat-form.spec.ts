import { TestBed } from '@angular/core/testing';

import { CheckPlatForm } from './check-plat-form';

describe('CheckPlatForm', () => {
  let service: CheckPlatForm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckPlatForm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
