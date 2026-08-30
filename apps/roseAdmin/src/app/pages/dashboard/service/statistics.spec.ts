import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { Statistics } from './statistics';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import { StatisticsResponse } from '../models/dashboard.models';

describe('Statistics', () => {
  let service: Statistics;
  let apiCallerSpy: { get: ReturnType<typeof vi.fn> };


  const mockResponse = {} as StatisticsResponse;

  beforeEach(() => {
    apiCallerSpy = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [Statistics, { provide: APICallerService, useValue: apiCallerSpy }],
    });

    service = TestBed.inject(Statistics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the API with the default query params', () => {
    apiCallerSpy.get.mockReturnValue(of(mockResponse));

    service.getStatistics().subscribe();

    expect(apiCallerSpy.get).toHaveBeenCalledTimes(1);
    const [endpoint, params] = apiCallerSpy.get.mock.calls[0];
    expect(endpoint).toBeDefined();
    expect(params.get('revenuePeriod')).toBe('monthly');
    expect(params.get('lowStockThreshold')).toBe('20');
    expect(params.get('topProductsLimit')).toBe('5');
    expect(params.get('lowStockLimit')).toBe('20');
  });

  it('should forward custom arguments as query params', () => {
    apiCallerSpy.get.mockReturnValue(of(mockResponse));

    service.getStatistics('weekly', 10, 8, 15).subscribe();

    const [, params] = apiCallerSpy.get.mock.calls[0];
    expect(params.get('revenuePeriod')).toBe('weekly');
    expect(params.get('lowStockThreshold')).toBe('10');
    expect(params.get('topProductsLimit')).toBe('8');
    expect(params.get('lowStockLimit')).toBe('15');
  });

  it('should emit the data returned by the API caller', () => {
    apiCallerSpy.get.mockReturnValue(of(mockResponse));

    let result: StatisticsResponse | undefined;
    service.getStatistics().subscribe((data) => (result = data));

    expect(result).toBe(mockResponse);
  });

  it('should log and rethrow when the API call fails', () => {
    const error = new Error('network error');
    apiCallerSpy.get.mockReturnValue(throwError(() => error));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let caught: unknown;
    service.getStatistics().subscribe({
      next: () => {
        throw new Error('should not emit a value on error');
      },
      error: (err) => (caught = err),
    });

    expect(caught).toBe(error);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load dashboard statistics', error);

    consoleSpy.mockRestore();
  });
});
