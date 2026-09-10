import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SubCategoriesStore } from '../store/sub-categories.store';
import { SubCategoriesService } from '../services/sub-categories.service';
import { SubCategory } from '../models/category.model';

const mockSubCategoryA: SubCategory = { id: 'sub-a1', title: 'Sub A1' };
const mockSubCategoryB: SubCategory = { id: 'sub-b1', title: 'Sub B1' };

const mockSubCategoriesService = {
    getSubCategories: vi.fn(),
};

describe('SubCategoriesStore', () => {
    let store: InstanceType<typeof SubCategoriesStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SubCategoriesStore,
                { provide: SubCategoriesService, useValue: mockSubCategoriesService },
            ],
        });
        store = TestBed.inject(SubCategoriesStore);
        mockSubCategoriesService.getSubCategories.mockReset();
    });

    it('should load sub-categories for a category', () => {
        mockSubCategoriesService.getSubCategories.mockReturnValue(of([mockSubCategoryA]));

        store.loadSubCategories('cat-a');

        expect(mockSubCategoriesService.getSubCategories).toHaveBeenCalledWith('cat-a');
        expect(store.entities()).toEqual([mockSubCategoryA]);
        expect(store.isLoading()).toBe(false);
        expect(store.loaded()).toBe(true);
        expect(store.error()).toBeNull();
    });

    it('should load all sub-categories when no category id is provided', () => {
        mockSubCategoriesService.getSubCategories.mockReturnValue(of([mockSubCategoryA, mockSubCategoryB]));

        store.loadSubCategories();

        expect(mockSubCategoriesService.getSubCategories).toHaveBeenCalledWith(undefined);
        expect(store.entities()).toEqual([mockSubCategoryA, mockSubCategoryB]);
    });

    it('should set error state on failure', () => {
        mockSubCategoriesService.getSubCategories.mockReturnValue(throwError(() => ({ message: 'Server error' })));

        store.loadSubCategories('cat-a');

        expect(store.error()).toBe('Server error');
        expect(store.isLoading()).toBe(false);
        expect(store.loaded()).toBe(true);
        expect(store.entities()).toEqual([]);
    });

    it('should clear entities when category changes', () => {
        mockSubCategoriesService.getSubCategories
            .mockReturnValueOnce(of([mockSubCategoryA]))
            .mockReturnValueOnce(of([mockSubCategoryB]));

        store.loadSubCategories('cat-a');
        expect(store.entities()).toEqual([mockSubCategoryA]);

        store.loadSubCategories('cat-b');
        expect(mockSubCategoriesService.getSubCategories).toHaveBeenCalledTimes(2);
        expect(store.entities()).toEqual([mockSubCategoryB]);
    });
});
