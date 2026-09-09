import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ProductCreatePage } from './product-create-page';
import { ProductFormValue } from '../product-form';
import { AdminProductsStore, CategoriesStore, OccasionsStore, ProductsService, SubCategoriesStore } from '@org/products';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockAdminProductsStore = {
    isSubmitting: signal(false),
    submitError: signal(null),
    addProduct: vi.fn(),
};

const mockCategoriesStore = {
    entities: vi.fn(() => [{ id: 'cat-1', title: 'Roses' }]),
    isLoading: vi.fn(() => false),
    loaded: vi.fn(() => true),
    loadOnce: vi.fn(),
};

const mockOccasionsStore = {
    entities: vi.fn(() => [{ id: 'occ-1', title: 'Birthday' }]),
    isLoading: vi.fn(() => false),
    loaded: vi.fn(() => true),
    loadOnce: vi.fn(),
};

const mockSubCategoriesStore = {
    entities: vi.fn(() => []),
    loadSubCategories: vi.fn(),
};

const mockProductsService = {
    uploadImage: vi.fn(),
};

const mockRouter = {
    navigate: vi.fn(),
};

describe('ProductCreatePage', () => {
    let fixture: ComponentFixture<ProductCreatePage>;
    let component: ProductCreatePage;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductCreatePage],
            providers: [
                { provide: AdminProductsStore, useValue: mockAdminProductsStore },
                { provide: CategoriesStore, useValue: mockCategoriesStore },
                { provide: OccasionsStore, useValue: mockOccasionsStore },
                { provide: SubCategoriesStore, useValue: mockSubCategoriesStore },
                { provide: ProductsService, useValue: mockProductsService },
                { provide: Router, useValue: mockRouter },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductCreatePage);
        component = fixture.componentInstance;
        mockAdminProductsStore.isSubmitting.set(false);
        mockAdminProductsStore.submitError.set(null);
        mockAdminProductsStore.addProduct.mockReset();
        mockAdminProductsStore.addProduct.mockReturnValue(of({ product: { id: 'prod-1' } }));
        mockRouter.navigate.mockReset();
        mockCategoriesStore.loadOnce.mockReset();
        mockOccasionsStore.loadOnce.mockReset();
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load categories and occasions on init', () => {
        fixture.detectChanges();

        expect(mockCategoriesStore.loadOnce).toHaveBeenCalled();
        expect(mockOccasionsStore.loadOnce).toHaveBeenCalled();
    });

    it('should create product and navigate on success', () => {
        fixture.detectChanges();

        const formValue = {
            title: 'Rose Box',
            description: '',
            price: 100,
            stock: 10,
            discountType: '',
            discountValue: null,
            cover: '',
            gallery: [],
            categoryId: 'cat-1',
            subCategoryId: '',
            occasionIds: [],
        };

        component.onSave(formValue as ProductFormValue);

        expect(mockAdminProductsStore.addProduct).toHaveBeenCalledWith({
            title: 'Rose Box',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products']);
    });

    it('should include optional fields in create payload when provided', () => {
        fixture.detectChanges();

        const formValue: ProductFormValue = {
            title: 'Rose Box',
            description: 'A nice box',
            price: 100,
            stock: 10,
            discountType: 'PERCENT',
            discountValue: 10,
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/1.jpg'],
            categoryId: 'cat-1',
            subCategoryId: '',
            occasionIds: ['occ-1'],
        };

        component.onSave(formValue);

        expect(mockAdminProductsStore.addProduct).toHaveBeenCalledWith({
            title: 'Rose Box',
            description: 'A nice box',
            price: 100,
            stock: 10,
            discountType: 'PERCENT',
            discountValue: 10,
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/1.jpg'],
            categoryId: 'cat-1',
            occasionIds: ['occ-1'],
        });
    });
});
