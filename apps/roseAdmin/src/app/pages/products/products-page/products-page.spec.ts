import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ProductsPage } from './products-page';
import { ProductsService } from '@org/products';
import { CategoriesStore } from '@org/products';
import { ConfirmationService } from 'primeng/api';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockProductsService = {
    getAllProducts: vi.fn(),
    deleteProduct: vi.fn(),
};

const mockCategoriesStore = {
    entities: vi.fn(() => [{ id: 'cat-1', title: 'Roses' }]),
    isLoading: vi.fn(() => false),
    loaded: vi.fn(() => true),
    error: vi.fn(() => null),
    loadOnce: vi.fn(),
};

const mockRouter = {
    navigate: vi.fn(),
};

const mockConfirmationService = {
    requireConfirmation$: new Subject(),
    confirm: vi.fn((config) => config.accept?.()),
};

const mockProductsResponse = {
    data: [
        {
            id: 'prod-1',
            title: 'Rose Box',
            price: '100',
            stock: 10,
            rating: 4.5,
            ratings: 12,
            category: { id: 'cat-1', title: 'Roses' },
            _count: { reviews: 12, cartItems: 5, wishlistItems: 3 },
        },
    ],
    metadata: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

describe('ProductsPage', () => {
    let fixture: ComponentFixture<ProductsPage>;
    let component: ProductsPage;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductsPage],
            providers: [
                { provide: ProductsService, useValue: mockProductsService },
                { provide: CategoriesStore, useValue: mockCategoriesStore },
                { provide: Router, useValue: mockRouter },
                { provide: ConfirmationService, useValue: mockConfirmationService },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductsPage);
        component = fixture.componentInstance;
        mockProductsService.getAllProducts.mockReset();
        mockProductsService.deleteProduct.mockReset();
        mockRouter.navigate.mockReset();
        mockCategoriesStore.loadOnce.mockReset();
    });

    it('should create', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load products on init', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));

        fixture.detectChanges();

        expect(mockProductsService.getAllProducts).toHaveBeenCalledWith({ page: 1, limit: 10 });
        expect(component.products()).toEqual(mockProductsResponse.data);
        expect(component.totalRecords()).toBe(1);
    });

    it('should load categories on init', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));

        fixture.detectChanges();

        expect(mockCategoriesStore.loadOnce).toHaveBeenCalled();
    });

    it('should apply search filter with debounce', async () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));
        fixture.detectChanges();

        component.searchControl.setValue('rose');
        await new Promise(resolve => setTimeout(resolve, 450));

        expect(mockProductsService.getAllProducts).toHaveBeenLastCalledWith(
            expect.objectContaining({ search: 'rose', page: 1 }),
        );
    });

    it('should apply category filter', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));
        fixture.detectChanges();

        component.onCategoryChange('cat-1');

        expect(mockProductsService.getAllProducts).toHaveBeenLastCalledWith(
            expect.objectContaining({ categoryId: 'cat-1', page: 1 }),
        );
    });

    it('should navigate to create product page', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));
        fixture.detectChanges();

        component.onAddProduct();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products/create']);
    });

    it('should navigate to edit product page', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));
        fixture.detectChanges();

        component.onEditProduct(mockProductsResponse.data[0]);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products', 'prod-1', 'edit']);
    });

    it('should delete product and reload list', () => {
        mockProductsService.getAllProducts.mockReturnValue(of(mockProductsResponse));
        mockProductsService.deleteProduct.mockReturnValue(of({}));
        fixture.detectChanges();

        component.onDeleteProduct(mockProductsResponse.data[0]);

        expect(mockProductsService.deleteProduct).toHaveBeenCalledWith('prod-1');
        expect(mockProductsService.getAllProducts).toHaveBeenCalledTimes(2);
    });
});
