import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ProductEditPage } from './product-edit-page';
import { ProductFormValue } from '../product-form';
import { AdminProductsStore, CategoriesStore, OccasionsStore, ProductsService, SubCategoriesStore } from '@org/products';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockAdminProductsStore = {
    selectedProduct: signal(null),
    isLoading: signal(false),
    isSubmitting: signal(false),
    error: signal(null),
    submitError: signal(null),
    loadProductById: vi.fn(),
    updateProduct: vi.fn(),
};

const mockProductsService = {
    uploadImage: vi.fn(),
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

const mockRouter = {
    navigate: vi.fn(),
};

const mockActivatedRoute = {
    snapshot: {
        paramMap: {
            get: vi.fn(() => 'prod-1'),
        },
    },
};

const mockProduct = {
    id: 'prod-1',
    title: 'Rose Box',
    description: 'A nice box',
    price: '100',
    stock: 10,
    discountType: 'PERCENT',
    discountValue: '10',
    cover: 'https://example.com/cover.jpg',
    gallery: ['https://example.com/1.jpg'],
    categoryId: 'cat-1',
    subCategoryId: 'sub-1',
    category: { id: 'cat-1', title: 'Roses' },
    subCategory: { id: 'sub-1', title: 'Red Roses' },
    occasions: [{ id: 'occ-1', title: 'Birthday' }],
};

describe('ProductEditPage', () => {
    let fixture: ComponentFixture<ProductEditPage>;
    let component: ProductEditPage;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductEditPage],
            providers: [
                { provide: AdminProductsStore, useValue: mockAdminProductsStore },
                { provide: ProductsService, useValue: mockProductsService },
                { provide: CategoriesStore, useValue: mockCategoriesStore },
                { provide: OccasionsStore, useValue: mockOccasionsStore },
                { provide: SubCategoriesStore, useValue: mockSubCategoriesStore },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductEditPage);
        component = fixture.componentInstance;

        mockAdminProductsStore.selectedProduct.set(null);
        mockAdminProductsStore.isLoading.set(false);
        mockAdminProductsStore.isSubmitting.set(false);
        mockAdminProductsStore.error.set(null);
        mockAdminProductsStore.submitError.set(null);
        mockAdminProductsStore.loadProductById.mockReset();
        mockAdminProductsStore.updateProduct.mockReset();
        mockAdminProductsStore.updateProduct.mockReturnValue(of({ product: mockProduct }));
        mockRouter.navigate.mockReset();
    });

    it('should create', () => {
        mockAdminProductsStore.selectedProduct.set(mockProduct);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load product on init', () => {
        mockAdminProductsStore.selectedProduct.set(mockProduct);
        fixture.detectChanges();

        expect(mockAdminProductsStore.loadProductById).toHaveBeenCalledWith('prod-1');
        expect(component.initialValue()?.title).toBe('Rose Box');
    });

    it('should show error when product fails to load', () => {
        mockAdminProductsStore.error.set('Not found');
        fixture.detectChanges();

        expect(component.error()).toBe('Not found');
    });

    it('should update product and navigate on success', () => {
        mockAdminProductsStore.selectedProduct.set(mockProduct);
        fixture.detectChanges();

        const formValue: ProductFormValue = {
            title: 'Updated Rose Box',
            description: 'A nice box',
            price: 120,
            stock: 15,
            discountType: 'PERCENT',
            discountValue: 10,
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/1.jpg'],
            categoryId: 'cat-1',
            subCategoryId: 'sub-1',
            occasionIds: ['occ-1'],
        };

        component.onSave(formValue);

        expect(mockAdminProductsStore.updateProduct).toHaveBeenCalledWith('prod-1', {
            title: 'Updated Rose Box',
            description: 'A nice box',
            price: 120,
            stock: 15,
            discountType: 'PERCENT',
            discountValue: 10,
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/1.jpg'],
            categoryId: 'cat-1',
            occasionIds: ['occ-1'],
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products']);
    });
});
