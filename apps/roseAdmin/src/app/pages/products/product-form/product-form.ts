import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, take } from 'rxjs';
import { ProductsService, Category, Occasion, SubCategory } from '@org/products';
import { Button, Message, Spinner } from '@org/shared-ui-components';
import { FormControlComponent } from '@org/shared-ui-components';
import { ProductFormValue } from './product-form.model';
import { DISCOUNT_TYPE_OPTIONS, MAX_GALLERY_IMAGES } from './product-form.constants';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe, Button, Message, Spinner, FormControlComponent],
    templateUrl: './product-form.html',
    styleUrl: './product-form.css',
})
export class ProductFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly productsService = inject(ProductsService);

    readonly initialValue = input<Partial<ProductFormValue> | null>(null);
    readonly categories = input<Category[]>([]);
    readonly subCategories = input<SubCategory[]>([]);
    readonly occasions = input<Occasion[]>([]);
    readonly isSubmitting = input<boolean>(false);
    readonly error = input<string | null>(null);

    readonly save = output<ProductFormValue>();
    readonly formCancel = output<void>();
    readonly categoryChange = output<string | null>();

    readonly isUploadingCover = signal(false);
    readonly isUploadingGallery = signal(false);
    readonly uploadError = signal<string | null>(null);

    readonly discountTypeOptions = DISCOUNT_TYPE_OPTIONS;

    readonly form = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
        description: ['', Validators.maxLength(1000)],
        price: [null as number | null, [Validators.required, Validators.min(0.01)]],
        stock: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        discountType: [''],
        discountValue: [null as number | null],
        cover: [''],
        gallery: this.fb.control<string[]>([], { validators: this.galleryValidator.bind(this) }),
        categoryId: ['', Validators.required],
        subCategoryId: [''],
        occasionIds: this.fb.control<string[]>([]),
    });

    constructor() {
        effect(() => {
            const value = this.initialValue();
            if (value) {
                this.form.patchValue({
                    ...value,
                    occasionIds: value.occasionIds ?? [],
                    gallery: value.gallery ?? [],
                });
            }
        });

        this.form.controls.categoryId.valueChanges.subscribe((categoryId) => {
            this.categoryChange.emit(categoryId || null);
            this.form.controls.subCategoryId.setValue('');
        });
    }

    private galleryValidator(control: { value?: string[] | null }) {
        const value = control.value ?? [];
        if (value.length > MAX_GALLERY_IMAGES) {
            return { maxGallery: { max: MAX_GALLERY_IMAGES, actual: value.length } };
        }
        return null;
    }

    onSubmit(): void {
        if (this.form.invalid || this.isSubmitting() || this.isUploadingCover() || this.isUploadingGallery()) {
            this.form.markAllAsTouched();
            return;
        }

        this.save.emit(this.form.getRawValue() as ProductFormValue);
    }

    onCancel(): void {
        this.formCancel.emit();
    }

    onCoverSelected(file: File | null): Promise<void> {
        if (!file) return Promise.resolve();

        this.isUploadingCover.set(true);
        this.uploadError.set(null);

        return new Promise((resolve) => {
            this.productsService
                .uploadImage(file)
                .pipe(take(1), finalize(() => this.isUploadingCover.set(false)))
                .subscribe({
                    next: (res) => {
                        this.form.controls.cover.setValue(res.imageUrl);
                        resolve();
                    },
                    error: (err: { message?: string }) => {
                        this.uploadError.set(err.message ?? 'ADMIN.PRODUCTS.UPLOAD_ERROR');
                        resolve();
                    },
                });
        });
    }

    onGallerySelected(files: FileList | File[] | null): Promise<void> {
        if (!files || files.length === 0) return Promise.resolve();

        const fileArray = Array.from(files);
        const currentGallery = this.form.controls.gallery.value ?? [];
        const remainingSlots = MAX_GALLERY_IMAGES - currentGallery.length;

        if (remainingSlots <= 0) {
            this.uploadError.set('ADMIN.PRODUCTS.GALLERY_MAX_ERROR');
            return Promise.resolve();
        }

        const filesToUpload = fileArray.slice(0, remainingSlots);
        this.isUploadingGallery.set(true);
        this.uploadError.set(null);

        return new Promise((resolve) => {
            const uploads = filesToUpload.map((file) =>
                this.productsService
                    .uploadImage(file)
                    .pipe(take(1))
                    .toPromise()
                    .then((res) => res?.imageUrl)
                    .catch(() => null),
            );

            Promise.all(uploads).then((urls) => {
                const validUrls = urls.filter((url): url is string => !!url);
                this.form.controls.gallery.setValue([...currentGallery, ...validUrls]);
                this.isUploadingGallery.set(false);

                if (validUrls.length < filesToUpload.length) {
                    this.uploadError.set('ADMIN.PRODUCTS.UPLOAD_PARTIAL_ERROR');
                }
                resolve();
            });
        });
    }

    removeGalleryImage(index: number): void {
        const gallery = [...(this.form.controls.gallery.value ?? [])];
        gallery.splice(index, 1);
        this.form.controls.gallery.setValue(gallery);
    }

    resetForm(): void {
        this.form.reset({
            title: '',
            description: '',
            price: null,
            stock: null,
            discountType: '',
            discountValue: null,
            cover: '',
            gallery: [],
            categoryId: '',
            subCategoryId: '',
            occasionIds: [],
        });
    }
}
