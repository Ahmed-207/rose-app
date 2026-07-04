import { TestBed } from '@angular/core/testing';

import { MapApiProduct } from './map-api-product';

describe('MapApiProduct', () => {
  let service: MapApiProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapApiProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
