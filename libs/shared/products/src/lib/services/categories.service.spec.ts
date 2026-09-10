import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoriesService } from './categories.service';
import { APICallerService } from '../utilities/api-caller-service';
import { FilterParams } from '../models/filter.model';

const mockApiCaller = {
    get: vi.fn(),
};

describe('CategoriesService', () => {
    let service: CategoriesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CategoriesService,
                { provide: APICallerService, useValue: mockApiCaller },
            ],
        });
        service = TestBed.inject(CategoriesService);
        mockApiCaller.get.mockReset();
    });

    it('should load categories without filters', () => {
        mockApiCaller.get.mockReturnValue(of({ data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 0 } }));

        service.getCategories().subscribe();

        expect(mockApiCaller.get).toHaveBeenCalledWith('categories', expect.anything());
    });

    it('should pass page, limit and search filters to the backend', () => {
        mockApiCaller.get.mockReturnValue(of({ data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 0 } }));

        const filters: FilterParams = { page: 2, limit: 25, search: 'roses' };
        service.getCategories(filters).subscribe();

        const [, params] = mockApiCaller.get.mock.calls[0] as [string, unknown];
        expect(params.toString()).toContain('page=2');
        expect(params.toString()).toContain('limit=25');
        expect(params.toString()).toContain('search=roses');
    });
});
