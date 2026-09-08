import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductCreatePage } from './product-create-page';
import { ProductFormValue } from '../product-form';
import { ProductsService, CategoriesStore, OccasionsStore, SubCategoriesStore } from '@org/products';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockProductsService = {
    createProduct: vi.fn(),
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
    isLoading: vi.fn(() => false),
    loadSubCategories: vi.fn(),
    reset: vi.fn(),
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
                { provide: ProductsService, useValue: mockProductsService },
                { provide: CategoriesStore, useValue: mockCategoriesStore },
                { provide: OccasionsStore, useValue: mockOccasionsStore },
                { provide: SubCategoriesStore, useValue: mockSubCategoriesStore },
                { provide: Router, useValue: mockRouter },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductCreatePage);
        component = fixture.componentInstance;
        mockProductsService.createProduct.mockReset();
        mockRouter.navigate.mockReset();
        mockCategoriesStore.loadOnce.mockReset();
        mockOccasionsStore.loadOnce.mockReset();
        mockSubCategoriesStore.loadSubCategories.mockReset();
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

    it('should load sub-categories when category changes', () => {
        fixture.detectChanges();

        component.onCategoryChange('cat-1');

        expect(mockSubCategoriesStore.loadSubCategories).toHaveBeenCalledWith('cat-1');
    });

    it('should create product and navigate on success', () => {
        mockProductsService.createProduct.mockReturnValue(of({ product: { id: 'prod-1' } }));
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

        expect(mockProductsService.createProduct).toHaveBeenCalledWith({
            title: 'Rose Box',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products']);
    });

    it('should not include empty optional fields in create payload', () => {
        mockProductsService.createProduct.mockReturnValue(of({ product: { id: 'prod-1' } }));
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
            subCategoryId: 'sub-1',
            occasionIds: ['occ-1'],
        };

        component.onSave(formValue);

        expect(mockProductsService.createProduct).toHaveBeenCalledWith(formValue);
    });
});
