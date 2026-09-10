import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SubCategoriesService } from './sub-categories.service';
import { CategoriesService } from './categories.service';
import { Category } from '../models/category.model';

const mockCategoriesService = {
    getCategories: vi.fn(),
};

const categoryA: Category = {
    id: 'cat-a',
    title: 'Category A',
    description: '',
    image: '',
    immutable: false,
    createdAt: '',
    updatedAt: '',
    _count: { products: 0 },
    subCategories: [
        { id: 'sub-a1', title: 'Sub A1' },
        { id: 'sub-a2', title: 'Sub A2' },
    ],
};

const categoryB: Category = {
    id: 'cat-b',
    title: 'Category B',
    description: '',
    image: '',
    immutable: false,
    createdAt: '',
    updatedAt: '',
    _count: { products: 0 },
    subCategories: [{ id: 'sub-b1', title: 'Sub B1' }],
};

describe('SubCategoriesService', () => {
    let service: SubCategoriesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SubCategoriesService,
                { provide: CategoriesService, useValue: mockCategoriesService },
            ],
        });
        service = TestBed.inject(SubCategoriesService);
        mockCategoriesService.getCategories.mockReset();
    });

    it('should load sub-categories for a given category id', () => {
        mockCategoriesService.getCategories.mockReturnValue(
            of({ data: [categoryA, categoryB], metadata: { page: 1, limit: 10, total: 2, totalPages: 1 } }),
        );

        service.getSubCategories('cat-a').subscribe(subCategories => {
            expect(subCategories).toEqual(categoryA.subCategories);
        });

        expect(mockCategoriesService.getCategories).toHaveBeenCalledWith({ page: 1, limit: 1000 });
    });

    it('should return all sub-categories when no category id is provided', () => {
        mockCategoriesService.getCategories.mockReturnValue(
            of({ data: [categoryA, categoryB], metadata: { page: 1, limit: 10, total: 2, totalPages: 1 } }),
        );

        service.getSubCategories().subscribe(subCategories => {
            expect(subCategories).toEqual([...categoryA.subCategories, ...categoryB.subCategories]);
        });
    });

    it('should return an empty array when the category is not found', () => {
        mockCategoriesService.getCategories.mockReturnValue(
            of({ data: [categoryA], metadata: { page: 1, limit: 10, total: 1, totalPages: 1 } }),
        );

        service.getSubCategories('unknown').subscribe(subCategories => {
            expect(subCategories).toEqual([]);
        });
    });
});
