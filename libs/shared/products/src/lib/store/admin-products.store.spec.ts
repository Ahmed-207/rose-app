import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminProductsStore } from './admin-products.store';
import { ProductsService } from '../services/products.service';

const mockProduct = {
    id: 'prod-1',
    title: 'Rose Box',
    description: 'A nice box',
    rating: 4.5,
    ratings: 12,
    stock: 10,
    price: '100',
    discountType: '',
    discountValue: '',
    cover: '',
    gallery: '',
    categoryId: 'cat-1',
    subCategoryId: '',
    immutable: false,
    deletedAt: null,
    createdAt: '',
    updatedAt: '',
    category: { id: 'cat-1', title: 'Roses' },
    subCategory: { id: '', title: '' },
    occasions: [],
    _count: { reviews: 0, cartItems: 0, wishlistItems: 0 },
} as never;

const mockProductsService = {
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
};

describe('AdminProductsStore', () => {
    let store: AdminProductsStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: ProductsService, useValue: mockProductsService }],
        });

        store = TestBed.inject(AdminProductsStore);

        mockProductsService.getAllProducts.mockReset();
        mockProductsService.getProductById.mockReset();
        mockProductsService.createProduct.mockReset();
        mockProductsService.updateProduct.mockReset();
        mockProductsService.deleteProduct.mockReset();
    });

    describe('loadProducts', () => {
        it('should set loading and then store entities + total', () => {
            mockProductsService.getAllProducts.mockReturnValue(
                of({ data: [mockProduct], metadata: { page: 1, limit: 10, total: 1, totalPages: 1 } }),
            );

            store.loadProducts({ page: 1, limit: 10 });

            expect(store.isLoading()).toBe(false);
            expect(store.entities()).toEqual([mockProduct]);
            expect(store.totalProducts()).toBe(1);
            expect(store.error()).toBeNull();
        });

        it('should set error on failure', () => {
            mockProductsService.getAllProducts.mockReturnValue(throwError(() => ({ message: 'Server error' })));

            store.loadProducts({ page: 1, limit: 10 });

            expect(store.isLoading()).toBe(false);
            expect(store.entities()).toEqual([]);
            expect(store.error()).toBe('Server error');
        });
    });

    describe('loadProductById', () => {
        it('should set selectedProduct on success', () => {
            mockProductsService.getProductById.mockReturnValue(of({ product: mockProduct }));

            store.loadProductById('prod-1');

            expect(store.isLoading()).toBe(false);
            expect(store.selectedProduct()).toEqual(mockProduct);
            expect(store.error()).toBeNull();
        });

        it('should set error on failure', () => {
            mockProductsService.getProductById.mockReturnValue(throwError(() => ({ message: 'Not found' })));

            store.loadProductById('prod-1');

            expect(store.isLoading()).toBe(false);
            expect(store.selectedProduct()).toBeNull();
            expect(store.error()).toBe('Not found');
        });
    });

    describe('addProduct', () => {
        it('should add the created product to entities', () => {
            mockProductsService.createProduct.mockReturnValue(of({ product: mockProduct }));

            store.addProduct({ title: 'Rose Box', price: 100, stock: 10, categoryId: 'cat-1' }).subscribe();

            expect(store.isSubmitting()).toBe(false);
            expect(store.entities()).toContainEqual(mockProduct);
            expect(store.submitError()).toBeNull();
        });

        it('should set submitError on failure', () => {
            mockProductsService.createProduct.mockReturnValue(throwError(() => ({ message: 'Create failed' })));

            store.addProduct({ title: 'Rose Box', price: 100, stock: 10, categoryId: 'cat-1' }).subscribe({ error: () => {} });

            expect(store.isSubmitting()).toBe(false);
            expect(store.submitError()).toBe('Create failed');
        });
    });

    describe('updateProduct', () => {
        it('should update the existing entity and selectedProduct', () => {
            mockProductsService.getAllProducts.mockReturnValue(
                of({ data: [mockProduct], metadata: { page: 1, limit: 10, total: 1, totalPages: 1 } }),
            );
            store.loadProducts({ page: 1, limit: 10 });

            const updated = { ...mockProduct, title: 'Updated Rose Box' };
            mockProductsService.updateProduct.mockReturnValue(of({ product: updated }));
            store.selectedProduct.set(mockProduct);

            store.updateProduct('prod-1', { title: 'Updated Rose Box' }).subscribe();

            expect(store.isSubmitting()).toBe(false);
            expect(store.entities()[0].title).toBe('Updated Rose Box');
            expect(store.selectedProduct()?.title).toBe('Updated Rose Box');
        });

        it('should set submitError on failure', () => {
            mockProductsService.updateProduct.mockReturnValue(throwError(() => ({ message: 'Update failed' })));

            store.updateProduct('prod-1', { title: 'Updated' }).subscribe({ error: () => {} });

            expect(store.isSubmitting()).toBe(false);
            expect(store.submitError()).toBe('Update failed');
        });
    });

    describe('deleteProduct', () => {
        it('should remove the entity and clear selectedProduct', () => {
            mockProductsService.getAllProducts.mockReturnValue(
                of({ data: [mockProduct], metadata: { page: 1, limit: 10, total: 1, totalPages: 1 } }),
            );
            store.loadProducts({ page: 1, limit: 10 });
            store.selectedProduct.set(mockProduct);

            mockProductsService.deleteProduct.mockReturnValue(of({}));

            store.deleteProduct('prod-1').subscribe();

            expect(store.isSubmitting()).toBe(false);
            expect(store.entities()).toEqual([]);
            expect(store.selectedProduct()).toBeNull();
        });

        it('should set submitError on failure', () => {
            mockProductsService.deleteProduct.mockReturnValue(throwError(() => ({ message: 'Delete failed' })));

            store.deleteProduct('prod-1').subscribe({ error: () => {} });

            expect(store.isSubmitting()).toBe(false);
            expect(store.submitError()).toBe('Delete failed');
        });
    });
});
