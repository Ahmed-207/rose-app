import { TestBed } from '@angular/core/testing';
import { OccasionsService } from './occasions.service';
import { APICallerService } from '../../../shared/utilities/api-caller-service';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { OCCASION, UPLOAD } from '@org/products';
import { vi } from 'vitest';

describe('OccasionsService', () => {
  let service: OccasionsService;
  let apiCallerSpy: { get: any; post: any; patch: any; delete: any };

  beforeEach(() => {
    apiCallerSpy = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        OccasionsService,
        { provide: APICallerService, useValue: apiCallerSpy },
      ],
    });

    service = TestBed.inject(OccasionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch occasion list with pagination and search parameters', () => {
    const mockResponse = { payload: { data: [], metadata: { total: 0 } } };
    apiCallerSpy.get.mockReturnValue(of(mockResponse));

    service.getOccasionList(1, 10, 'birthday').subscribe((res) => {
      expect(res).toEqual(mockResponse as any);
    });

    expect(apiCallerSpy.get).toHaveBeenCalledWith(
      OCCASION.getOccasions,
      expect.any(HttpParams)
    );
  });

  it('should fetch occasion by id and extract occasion object if wrapped', () => {
    const mockOccasion = { id: '1', title: 'Graduation', description: 'Party' };
    apiCallerSpy.get.mockReturnValue(of({ occasion: mockOccasion }));

    service.getById('1').subscribe((data) => {
      expect(data).toEqual(mockOccasion as any);
    });

    expect(apiCallerSpy.get).toHaveBeenCalledWith(`${OCCASION.getOccasions}/1`);
  });

  it('should create a new occasion', () => {
    const payload = { title: 'New Year', description: 'Celebration' };
    apiCallerSpy.post.mockReturnValue(of({ id: '2', ...payload }));

    service.create(payload).subscribe((res) => {
      expect(res.title).toBe('New Year');
    });

    expect(apiCallerSpy.post).toHaveBeenCalledWith(OCCASION.getOccasions, payload);
  });

  it('should update an existing occasion', () => {
    const payload = { title: 'Updated Title', description: 'Updated Desc' };
    apiCallerSpy.patch.mockReturnValue(of({ occasion: { id: '1', ...payload } }));

    service.update('1', payload).subscribe((res) => {
      expect(res.title).toBe('Updated Title');
    });

    expect(apiCallerSpy.patch).toHaveBeenCalledWith(`${OCCASION.getOccasions}/1`, payload);
  });

  it('should delete an occasion by id', () => {
    apiCallerSpy.delete.mockReturnValue(of({ message: 'Deleted' }));

    service.delete('1').subscribe((res) => {
      expect(res.message).toBe('Deleted');
    });

    expect(apiCallerSpy.delete).toHaveBeenCalledWith(`${OCCASION.getOccasions}/1`);
  });

  it('should upload image and append base URL if a relative path is returned', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    apiCallerSpy.post.mockReturnValue(of({ payload: { url: '/api/upload/temp/123.png' } }));

    service.uploadImage(mockFile).subscribe((res) => {
      expect(res.url).toBe('https://rose.app.elevate.bootcamp.cloud/api/upload/temp/123.png');
    });

    expect(apiCallerSpy.post).toHaveBeenCalledWith(UPLOAD.uploadImage, expect.any(FormData));
  });
});