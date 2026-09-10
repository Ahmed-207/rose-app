import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of, throwError } from 'rxjs';
import { CategoriesStore } from '../store/categories.store';
import { CategoriesService } from '../services/categories.service';
import { Category, CategoryResponseDto } from '../models/category.model';

const mockCategory: Category = {
    id: 'cat-1',
    title: 'Roses',
    description: 'Red roses',
    image: 'rose.jpg',
    immutable: false,
    createdAt: '',
    updatedAt: '',
    subCategories: [],
    _count: { products: 5 },
};

const mockResponse: CategoryResponseDto = {
    data: [mockCategory],
    metadata: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

const mockCategoriesService = {
    getCategories: vi.fn(),
};

describe('CategoriesStore', () => {
    let store: InstanceType<typeof CategoriesStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CategoriesStore,
                { provide: CategoriesService, useValue: mockCategoriesService },
            ],
        });
        store = TestBed.inject(CategoriesStore);
        mockCategoriesService.getCategories.mockReset();
    });

    it('should load categories with pagination and search', () => {
        mockCategoriesService.getCategories.mockReturnValue(of(mockResponse));

        store.loadCategories({ page: 1, limit: 10, search: 'rose' });

        expect(mockCategoriesService.getCategories).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'rose' });
        expect(store.entities()).toEqual([mockCategory]);
        expect(store.totalResults()).toBe(1);
        expect(store.loaded()).toBe(true);
        expect(store.isLoading()).toBe(false);
    });

    it('should apply filters and reset to page 1', () => {
        mockCategoriesService.getCategories.mockReturnValue(of(mockResponse));

        patchState(store, { filters: { page: 3, limit: 25 } });
        store.applyFilters({ search: 'lily' });

        expect(mockCategoriesService.getCategories).toHaveBeenCalledWith({ page: 1, limit: 25, search: 'lily' });
    });

    it('should keep loadOnce behavior for existing consumers', () => {
        mockCategoriesService.getCategories.mockReturnValue(of(mockResponse));

        store.loadOnce();
        store.loadOnce();

        expect(mockCategoriesService.getCategories).toHaveBeenCalledTimes(1);
        expect(store.loaded()).toBe(true);
    });

    it('should set error state on failure', () => {
        mockCategoriesService.getCategories.mockReturnValue(throwError(() => ({ message: 'Server error' })));

        store.loadCategories({ page: 1, limit: 10 });

        expect(store.error()).toBe('Server error');
        expect(store.isLoading()).toBe(false);
        expect(store.loaded()).toBe(true);
    });
});
