import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { ProductsPage } from './products-page';
import { AdminProductsStore, CategoriesStore } from '@org/products';
import { ConfirmationService } from 'primeng/api';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockAdminProductsStore = {
    entities: signal([]),
    totalProducts: signal(0),
    isLoading: signal(false),
    error: signal(null),
    submitError: signal(null),
    loadProducts: vi.fn(),
    deleteProduct: vi.fn(),
};

const mockCategoriesStore = {
    entities: signal([{ id: 'cat-1', title: 'Roses' }]),
    isLoading: signal(false),
    loaded: signal(true),
    error: signal(null),
    loadOnce: vi.fn(),
};

const mockRouter = {
    navigate: vi.fn(),
};

const mockActivatedRoute = {
    snapshot: { queryParams: {} },
    queryParams: of({}),
};

const mockConfirmationService = {
    requireConfirmation$: new Subject(),
    confirm: vi.fn((config) => config.accept?.()),
};

const mockProduct = {
    id: 'prod-1',
    title: 'Rose Box',
    price: '100',
    stock: 10,
    rating: 4.5,
    ratings: 12,
    category: { id: 'cat-1', title: 'Roses' },
    _count: { reviews: 12, cartItems: 5, wishlistItems: 3 },
};

describe('ProductsPage', () => {
    let fixture: ComponentFixture<ProductsPage>;
    let component: ProductsPage;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductsPage],
            providers: [
                { provide: AdminProductsStore, useValue: mockAdminProductsStore },
                { provide: CategoriesStore, useValue: mockCategoriesStore },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: ConfirmationService, useValue: mockConfirmationService },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductsPage);
        component = fixture.componentInstance;

        mockAdminProductsStore.entities.set([]);
        mockAdminProductsStore.totalProducts.set(0);
        mockAdminProductsStore.isLoading.set(false);
        mockAdminProductsStore.error.set(null);
        mockAdminProductsStore.submitError.set(null);
        mockAdminProductsStore.loadProducts.mockReset();
        mockAdminProductsStore.deleteProduct.mockReset();
        mockAdminProductsStore.deleteProduct.mockReturnValue(of({}));
        mockRouter.navigate.mockReset();
        mockCategoriesStore.loadOnce.mockReset();
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load products on init', () => {
        fixture.detectChanges();

        expect(mockCategoriesStore.loadOnce).toHaveBeenCalled();
        expect(mockAdminProductsStore.loadProducts).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should apply search filter with debounce', async () => {
        fixture.detectChanges();
        mockAdminProductsStore.loadProducts.mockClear();

        component.searchControl.setValue('rose');
        await new Promise((resolve) => setTimeout(resolve, 450));

        expect(mockAdminProductsStore.loadProducts).toHaveBeenLastCalledWith(
            expect.objectContaining({ search: 'rose', page: 1 }),
        );
    });

    it('should apply category filter', () => {
        fixture.detectChanges();
        mockAdminProductsStore.loadProducts.mockClear();

        component.onCategoryChange('cat-1');

        expect(mockAdminProductsStore.loadProducts).toHaveBeenLastCalledWith(
            expect.objectContaining({ categoryId: 'cat-1', page: 1 }),
        );
    });

    it('should apply sort filter and reset to page 1', () => {
        fixture.detectChanges();
        mockAdminProductsStore.loadProducts.mockClear();

        component.onPageChange({ page: 2, limit: 10 });
        component.onSortChange({ field: 'price', order: 'desc' });

        expect(mockAdminProductsStore.loadProducts).toHaveBeenLastCalledWith(
            expect.objectContaining({ sortBy: 'price', sortOrder: 'desc', page: 1 }),
        );
    });

    it('should clear stale query params when filters reset', () => {
        fixture.detectChanges();

        component.onCategoryChange('cat-1');
        component.onCategoryChange(null);

        expect(mockRouter.navigate).toHaveBeenLastCalledWith(
            [],
            expect.objectContaining({
                queryParams: expect.objectContaining({ categoryId: null }),
            }),
        );
    });

    it('should navigate to create product page', () => {
        fixture.detectChanges();

        component.onAddProduct();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products/create']);
    });

    it('should navigate to edit product page', () => {
        fixture.detectChanges();

        component.onEditProduct(mockProduct as never);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products', 'prod-1', 'edit']);
    });

    it('should delete product and reload list', () => {
        fixture.detectChanges();
        mockAdminProductsStore.loadProducts.mockClear();

        component.onDeleteProduct(mockProduct as never);

        expect(mockAdminProductsStore.deleteProduct).toHaveBeenCalledWith('prod-1');
        expect(mockAdminProductsStore.loadProducts).toHaveBeenCalled();
    });
});
