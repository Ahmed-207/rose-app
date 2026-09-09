import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductsService } from './products.service';
import { APICallerService } from '../utilities/api-caller-service';
import { CreateProductRequest } from '../models/product.model';

const mockApiCaller = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
};

const mockProduct = {
    id: 'prod-1',
    title: 'Rose Box',
    price: '100',
    stock: 10,
    categoryId: 'cat-1',
};

describe('ProductsService admin methods', () => {
    let service: ProductsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ProductsService,
                { provide: APICallerService, useValue: mockApiCaller },
            ],
        });
        service = TestBed.inject(ProductsService);
        mockApiCaller.get.mockReset();
        mockApiCaller.post.mockReset();
        mockApiCaller.patch.mockReset();
        mockApiCaller.delete.mockReset();
    });

    it('should create a product', () => {
        mockApiCaller.post.mockReturnValue(of({ product: mockProduct }));

        const payload: CreateProductRequest = {
            title: 'Rose Box',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
            description: '',
        };

        service.createProduct(payload).subscribe(res => {
            expect(res.product).toEqual(mockProduct);
        });

        expect(mockApiCaller.post).toHaveBeenCalledWith('products', payload);
    });

    it('should update a product', () => {
        mockApiCaller.patch.mockReturnValue(of({ product: mockProduct }));

        const payload = { title: 'Updated Rose Box' };

        service.updateProduct('prod-1', payload).subscribe(res => {
            expect(res.product).toEqual(mockProduct);
        });

        expect(mockApiCaller.patch).toHaveBeenCalledWith('products/prod-1', payload);
    });

    it('should delete a product', () => {
        mockApiCaller.delete.mockReturnValue(of({}));

        service.deleteProduct('prod-1').subscribe();

        expect(mockApiCaller.delete).toHaveBeenCalledWith('products/prod-1');
    });

    it('should upload an image', () => {
        mockApiCaller.post.mockReturnValue(of({ url: 'https://example.com/image.jpg' }));

        const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', file);

        service.uploadImage(file).subscribe(res => {
            expect(res.url).toBe('https://example.com/image.jpg');
        });

        const [, body] = mockApiCaller.post.mock.calls[0] as [string, FormData];
        expect(mockApiCaller.post).toHaveBeenCalledWith('upload', expect.any(FormData));
        expect(body.get('image')).toBe(file);
    });
});
