import { TestBed } from '@angular/core/testing';

import { HoldingService } from './holding.service';

describe('HoldingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HoldingService = TestBed.get(HoldingService);
    expect(service).toBeTruthy();
  });
});
