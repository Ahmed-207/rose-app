import { TestBed } from '@angular/core/testing';
import { OccasionsService } from './occasions.service';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { OccasionListResponse, OccasionPayload } from '../models/occasion.models';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('OccasionsService', () => {
  let service: OccasionsService;
  let apiServiceMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockOccasion = {
    id: '1',
    title: 'Birthday',
    description: 'Birthday category',
    image: 'image.jpg',
    immutable: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  beforeEach(() => {
    apiServiceMock = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        OccasionsService,
        { provide: APICallerService, useValue: apiServiceMock },
      ],
    });

    service = TestBed.inject(OccasionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch occasion list', () => {
    const mockResponse: OccasionListResponse = {
      status: true,
      code: 200,
      payload: {
        data: [mockOccasion],
        metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };

    apiServiceMock.get.mockReturnValue(of(mockResponse));

    service.getOccasionList(1, 20).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        '/api/occasions',
        expect.any(HttpParams)
      );
    });
  });

  it('should fetch occasion by id', () => {
    apiServiceMock.get.mockReturnValue(of({ payload: mockOccasion }));

    service.getById('1').subscribe((res) => {
      expect(res).toEqual(mockOccasion);
      expect(apiServiceMock.get).toHaveBeenCalledWith('/api/occasions/1');
    });
  });

  it('should create new occasion', () => {
    const payload: OccasionPayload = { title: 'New', description: 'Desc' };
    apiServiceMock.post.mockReturnValue(of({ payload: mockOccasion }));

    service.create(payload).subscribe((res) => {
      expect(res).toEqual(mockOccasion);
      expect(apiServiceMock.post).toHaveBeenCalledWith('/api/occasions', payload);
    });
  });

  it('should delete an occasion', () => {
    const mockDeleteRes = { status: true, code: 200, message: 'Deleted' };
    apiServiceMock.delete.mockReturnValue(of(mockDeleteRes));

    service.delete('1').subscribe((res) => {
      expect(res).toEqual(mockDeleteRes);
      expect(apiServiceMock.delete).toHaveBeenCalledWith('/api/occasions/1');
    });
  });
});