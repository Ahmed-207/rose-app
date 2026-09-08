import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { ProductFormComponent } from './product-form';
import { ProductsService } from '@org/products';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

const mockProductsService = {
    uploadImage: vi.fn(),
};

describe('ProductFormComponent', () => {
    let fixture: ComponentFixture<ProductFormComponent>;
    let component: ProductFormComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductsService, useValue: mockProductsService },
                provideTestTranslate(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        mockProductsService.uploadImage.mockReset();
    });

    it('should create with default empty form', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.form.valid).toBe(false);
    });

    it('should validate required fields', () => {
        fixture.detectChanges();

        component.form.patchValue({
            title: '',
            price: 0,
            stock: -1,
            categoryId: '',
        });

        expect(component.form.controls.title.invalid).toBe(true);
        expect(component.form.controls.price.invalid).toBe(true);
        expect(component.form.controls.stock.invalid).toBe(true);
        expect(component.form.controls.categoryId.invalid).toBe(true);
    });

    it('should validate max gallery images', () => {
        fixture.detectChanges();

        const gallery = Array(6).fill('https://example.com/image.jpg');
        component.form.patchValue({ gallery });

        expect(component.form.controls.gallery.invalid).toBe(true);
    });

    it('should emit save event with valid form', () => {
        fixture.detectChanges();
        const saveSpy = vi.fn();
        component.save.subscribe(saveSpy);

        component.form.patchValue({
            title: 'Rose Box',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
        });

        component.onSubmit();

        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Rose Box',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
        }));
    });

    it('should not emit save when form is invalid', () => {
        fixture.detectChanges();
        const saveSpy = vi.fn();
        component.save.subscribe(saveSpy);

        component.onSubmit();

        expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should upload cover image and set cover value', async () => {
        mockProductsService.uploadImage.mockReturnValue(of({ imageUrl: 'https://example.com/cover.jpg' }));
        fixture.detectChanges();

        const file = new File([''], 'cover.jpg', { type: 'image/jpeg' });
        await component.onCoverSelected(file);

        expect(mockProductsService.uploadImage).toHaveBeenCalledWith(file);
        expect(component.form.controls.cover.value).toBe('https://example.com/cover.jpg');
    });

    it('should upload gallery images and append to gallery', async () => {
        mockProductsService.uploadImage.mockReturnValue(of({ imageUrl: 'https://example.com/gallery.jpg' }));
        fixture.detectChanges();

        const file = new File([''], 'gallery.jpg', { type: 'image/jpeg' });
        await component.onGallerySelected([file]);

        expect(mockProductsService.uploadImage).toHaveBeenCalledWith(file);
        expect(component.form.controls.gallery.value).toContain('https://example.com/gallery.jpg');
    });

    it('should remove gallery image', () => {
        fixture.detectChanges();

        component.form.patchValue({ gallery: ['https://example.com/1.jpg', 'https://example.com/2.jpg'] });
        component.removeGalleryImage(0);

        expect(component.form.controls.gallery.value).toEqual(['https://example.com/2.jpg']);
    });

    it('should reset form when reset input is true', () => {
        fixture.detectChanges();

        component.form.patchValue({
            title: 'Test',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
        });

        component.resetForm();

        expect(component.form.controls.title.value).toBe('');
        expect(component.form.controls.price.value).toBeNull();
        expect(component.form.controls.stock.value).toBeNull();
        expect(component.form.controls.categoryId.value).toBe('');
    });
});
