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

    it('should create with default empty custom form', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.customForm.valid).toBe(false);
    });

    it('should validate required custom fields', () => {
        fixture.detectChanges();

        component.customForm.patchValue({
            categoryId: '',
            occasionIds: [],
            cover: '',
            gallery: [],
        });

        expect(component.customForm.controls.categoryId.invalid).toBe(true);
        expect(component.customForm.controls.occasionIds.invalid).toBe(true);
        expect(component.customForm.controls.cover.invalid).toBe(true);
        expect(component.customForm.controls.gallery.invalid).toBe(true);
    });

    it('should validate max gallery images', () => {
        fixture.detectChanges();

        const gallery = Array(6).fill('https://example.com/image.jpg');
        component.customForm.patchValue({ gallery });

        expect(component.customForm.controls.gallery.invalid).toBe(true);
    });

    it('should emit save event when dynamic and custom forms are valid', () => {
        fixture.detectChanges();
        const saveSpy = vi.fn();
        component.save.subscribe(saveSpy);

        component.dynamicFormValue.set({
            title: 'Rose Box',
            description: 'A box of roses',
            price: 100,
            stock: 10,
            discountType: '',
            discountValue: null,
        });
        component.customForm.patchValue({
            categoryId: 'cat-1',
            occasionIds: ['occ-1'],
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/gallery.jpg'],
        });

        component.onDynamicFormSubmitted(component.dynamicFormValue());

        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Rose Box',
            description: 'A box of roses',
            price: 100,
            stock: 10,
            categoryId: 'cat-1',
            occasionIds: ['occ-1'],
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/gallery.jpg'],
        }));
    });

    it('should not emit save when custom form is invalid', () => {
        fixture.detectChanges();
        const saveSpy = vi.fn();
        component.save.subscribe(saveSpy);

        component.onDynamicFormSubmitted({
            title: 'Rose Box',
            description: 'A box of roses',
            price: 100,
            stock: 10,
            discountType: '',
            discountValue: null,
        });

        expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should upload cover image and set cover value', async () => {
        mockProductsService.uploadImage.mockReturnValue(of({ imageUrl: 'https://example.com/cover.jpg' }));
        fixture.detectChanges();

        const file = new File([''], 'cover.jpg', { type: 'image/jpeg' });
        await component.onCoverSelected(file);

        expect(mockProductsService.uploadImage).toHaveBeenCalledWith(file);
        expect(component.customForm.controls.cover.value).toBe('https://example.com/cover.jpg');
    });

    it('should upload gallery images and append to gallery', async () => {
        mockProductsService.uploadImage.mockReturnValue(of({ imageUrl: 'https://example.com/gallery.jpg' }));
        fixture.detectChanges();

        const file = new File([''], 'gallery.jpg', { type: 'image/jpeg' });
        await component.onGallerySelected([file]);

        expect(mockProductsService.uploadImage).toHaveBeenCalledWith(file);
        expect(component.customForm.controls.gallery.value).toContain('https://example.com/gallery.jpg');
    });

    it('should remove gallery image', () => {
        fixture.detectChanges();

        component.customForm.patchValue({ gallery: ['https://example.com/1.jpg', 'https://example.com/2.jpg'] });
        component.removeGalleryImage(0);

        expect(component.customForm.controls.gallery.value).toEqual(['https://example.com/2.jpg']);
    });

    it('should reset custom form', () => {
        fixture.detectChanges();

        component.customForm.patchValue({
            categoryId: 'cat-1',
            occasionIds: ['occ-1'],
            cover: 'https://example.com/cover.jpg',
            gallery: ['https://example.com/gallery.jpg'],
        });

        component.resetForm();

        expect(component.customForm.controls.categoryId.value).toBe('');
        expect(component.customForm.controls.occasionIds.value).toEqual([]);
        expect(component.customForm.controls.cover.value).toBe('');
        expect(component.customForm.controls.gallery.value).toEqual([]);
    });

    it('should calculate price after discount for percent discount', () => {
        fixture.detectChanges();

        component.dynamicFormValue.set({
            title: '',
            description: '',
            price: 100,
            stock: null,
            discountType: 'PERCENT',
            discountValue: 20,
        });

        expect(component.priceAfterDiscount()).toBe(80);
    });

    it('should calculate price after discount for fixed discount', () => {
        fixture.detectChanges();

        component.dynamicFormValue.set({
            title: '',
            description: '',
            price: 100,
            stock: null,
            discountType: 'FIXED',
            discountValue: 30,
        });

        expect(component.priceAfterDiscount()).toBe(70);
    });
});
