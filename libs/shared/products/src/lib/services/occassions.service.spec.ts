import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OccasionsService } from './occassions.service';
import { APICallerService } from '../utilities/api-caller-service';
import { FilterParams } from '../models/filter.model';

const mockApiCaller = {
    get: vi.fn(),
};

describe('OccasionsService', () => {
    let service: OccasionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OccasionsService,
                { provide: APICallerService, useValue: mockApiCaller },
            ],
        });
        service = TestBed.inject(OccasionsService);
        mockApiCaller.get.mockReset();
    });

    it('should load occasions without filters', () => {
        mockApiCaller.get.mockReturnValue(of({ data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 0 } }));

        service.getOccasions().subscribe();

        expect(mockApiCaller.get).toHaveBeenCalledWith('occasions', expect.anything());
    });

    it('should pass page, limit and search filters to the backend', () => {
        mockApiCaller.get.mockReturnValue(of({ data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 0 } }));

        const filters: FilterParams = { page: 3, limit: 50, search: 'birthday' };
        service.getOccasions(filters).subscribe();

        const [, params] = mockApiCaller.get.mock.calls[0] as [string, unknown];
        expect(params.toString()).toContain('page=3');
        expect(params.toString()).toContain('limit=50');
        expect(params.toString()).toContain('search=birthday');
    });
});
