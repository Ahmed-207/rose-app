import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductEditPage } from './product-edit-page';
import { ProductFormValue } from '../product-form';
import { ProductsService, CategoriesStore, OccasionsStore } from '@org/products';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockProductsService = {
    getProductById: vi.fn(),
    updateProduct: vi.fn(),
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
                { provide: ProductsService, useValue: mockProductsService },
                { provide: CategoriesStore, useValue: mockCategoriesStore },
                { provide: OccasionsStore, useValue: mockOccasionsStore },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductEditPage);
        component = fixture.componentInstance;
        mockProductsService.getProductById.mockReset();
        mockProductsService.updateProduct.mockReset();
        mockRouter.navigate.mockReset();
    });

    it('should create', () => {
        mockProductsService.getProductById.mockReturnValue(of({ product: mockProduct }));
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load product on init', () => {
        mockProductsService.getProductById.mockReturnValue(of({ product: mockProduct }));
        fixture.detectChanges();

        expect(mockProductsService.getProductById).toHaveBeenCalledWith('prod-1');
        expect(component.initialValue()?.title).toBe('Rose Box');
    });

    it('should show error when product fails to load', () => {
        mockProductsService.getProductById.mockReturnValue(throwError(() => ({ message: 'Not found' })));
        fixture.detectChanges();

        expect(component.error()).toBe('Not found');
    });

    it('should update product and navigate on success', () => {
        mockProductsService.getProductById.mockReturnValue(of({ product: mockProduct }));
        mockProductsService.updateProduct.mockReturnValue(of({ product: mockProduct }));
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

        expect(mockProductsService.updateProduct).toHaveBeenCalledWith('prod-1', {
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
