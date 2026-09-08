import { Component, ViewChild, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, take } from 'rxjs';
import { ProductsService, Category, Occasion } from '@org/products';
import { Button, Message, Spinner, FormControlComponent } from '@org/shared-ui-components';
import { DynamicFormComponent } from '../../../../../../shared/components/dynamic-form/dynamic-form';
import { DynamicFormField } from '../../../../../../shared/components/dynamic-form/dynamic-form.types';
import { ProductFormValue } from './product-form.model';
import { DISCOUNT_TYPE_OPTIONS, MAX_GALLERY_IMAGES } from './product-form.constants';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe, Button, Message, Spinner, FormControlComponent, DynamicFormComponent],
    templateUrl: './product-form.html',
    styleUrl: './product-form.css',
})
export class ProductFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly productsService = inject(ProductsService);

    @ViewChild('dynamicForm') private readonly dynamicFormRef!: DynamicFormComponent;

    readonly initialValue = input<Partial<ProductFormValue> | null>(null);
    readonly categories = input<Category[]>([]);
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

    readonly dynamicFields: DynamicFormField[] = [
        {
            name: 'title',
            type: 'text',
            label: 'ADMIN.PRODUCTS.FORM.TITLE',
            required: true,
            validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'ADMIN.PRODUCTS.FORM.DESCRIPTION',
            required: true,
            validators: [Validators.required, Validators.maxLength(1000)],
        },
        {
            name: 'price',
            type: 'number',
            label: 'ADMIN.PRODUCTS.FORM.PRICE',
            required: true,
            validators: [Validators.required, Validators.min(0.01)],
        },
        {
            name: 'stock',
            type: 'number',
            label: 'ADMIN.PRODUCTS.FORM.STOCK',
            required: true,
            validators: [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
        },
        {
            name: 'discountType',
            type: 'select',
            label: 'ADMIN.PRODUCTS.FORM.DISCOUNT_TYPE',
            options: DISCOUNT_TYPE_OPTIONS,
            optionLabel: 'title',
            optionValue: 'id',
        },
        {
            name: 'discountValue',
            type: 'number',
            label: 'ADMIN.PRODUCTS.FORM.DISCOUNT_VALUE',
            visibleWhen: (values: Record<string, unknown>) => !!values['discountType'],
        },
    ];

    readonly customForm = this.fb.group({
        categoryId: ['', Validators.required],
        occasionIds: this.fb.control<string[]>([], Validators.required),
        cover: ['', Validators.required],
        gallery: this.fb.control<string[]>([], [Validators.required, this.galleryValidator.bind(this)]),
    });

    readonly dynamicInitialValue = computed(() => {
        const value = this.initialValue();
        return {
            title: value?.title ?? '',
            description: value?.description ?? '',
            price: value?.price ?? null,
            stock: value?.stock ?? null,
            discountType: value?.discountType ?? '',
            discountValue: value?.discountValue ?? null,
        };
    });

    readonly dynamicFormValue = signal<Record<string, unknown>>(this.dynamicInitialValue());

    readonly priceAfterDiscount = computed(() => {
        const values = this.dynamicFormValue();
        const price = Number(values['price']) || 0;
        const discountType = String(values['discountType'] ?? '');
        const discountValue = Number(values['discountValue']) || 0;

        if (!discountType || !discountValue) return price;
        if (discountType === 'PERCENT') return price - (price * discountValue) / 100;
        if (discountType === 'FIXED') return Math.max(0, price - discountValue);
        return price;
    });

    constructor() {
        effect(() => {
            const value = this.initialValue();
            if (value) {
                this.customForm.patchValue({
                    categoryId: value.categoryId ?? '',
                    occasionIds: value.occasionIds ?? [],
                    cover: value.cover ?? '',
                    gallery: value.gallery ?? [],
                });
            }
        });

        this.customForm.controls.categoryId.valueChanges.subscribe((categoryId) => {
            this.categoryChange.emit(categoryId || null);
        });
    }

    onDynamicFormValueChange(values: Record<string, unknown>): void {
        this.dynamicFormValue.set(values);
    }

    onDynamicFormSubmitted(dynamicValues: Record<string, unknown>): void {
        this.customForm.markAllAsTouched();

        if (this.customForm.invalid || this.isSubmitting() || this.isUploadingCover() || this.isUploadingGallery()) {
            return;
        }

        const customValue = this.customForm.getRawValue();
        const value: ProductFormValue = {
            title: String(dynamicValues['title'] ?? ''),
            description: String(dynamicValues['description'] ?? ''),
            price: dynamicValues['price'] as number | null,
            stock: dynamicValues['stock'] as number | null,
            discountType: String(dynamicValues['discountType'] ?? ''),
            discountValue: dynamicValues['discountValue'] as number | null,
            cover: customValue.cover ?? '',
            gallery: customValue.gallery ?? [],
            categoryId: customValue.categoryId ?? '',
            subCategoryId: '',
            occasionIds: customValue.occasionIds ?? [],
        };

        this.save.emit(value);
    }

    onSubmit(): void {
        const dynamicValid = this.dynamicFormRef.submit();
        if (!dynamicValid) {
            this.customForm.markAllAsTouched();
        }
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
                        this.customForm.controls.cover.setValue(res.imageUrl);
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
        const currentGallery = this.customForm.controls.gallery.value ?? [];
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
                this.customForm.controls.gallery.setValue([...currentGallery, ...validUrls]);
                this.isUploadingGallery.set(false);

                if (validUrls.length < filesToUpload.length) {
                    this.uploadError.set('ADMIN.PRODUCTS.UPLOAD_PARTIAL_ERROR');
                }
                resolve();
            });
        });
    }

    removeGalleryImage(index: number): void {
        const gallery = [...(this.customForm.controls.gallery.value ?? [])];
        gallery.splice(index, 1);
        this.customForm.controls.gallery.setValue(gallery);
    }

    resetForm(): void {
        this.dynamicFormValue.set({
            title: '',
            description: '',
            price: null,
            stock: null,
            discountType: '',
            discountValue: null,
        });
        this.customForm.reset({
            categoryId: '',
            occasionIds: [],
            cover: '',
            gallery: [],
        });
    }

    private galleryValidator(control: AbstractControl<string[] | null>) {
        const value = control.value ?? [];
        if (value.length > MAX_GALLERY_IMAGES) {
            return { maxGallery: { max: MAX_GALLERY_IMAGES, actual: value.length } };
        }
        return null;
    }
}
