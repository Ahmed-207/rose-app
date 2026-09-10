import { Component, ViewChild, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize, take } from 'rxjs';
import { ProductsService, Category, Occasion, SubCategoriesStore } from '@org/products';
import { Button, Message, Spinner, FormControlComponent } from '@org/shared-ui-components';
import { DynamicFormComponent, DynamicFormField } from '@org/dynamic-form';
import { ProductFormValue } from './product-form.model';
import { DISCOUNT_TYPE_OPTIONS, MAX_GALLERY_IMAGES } from './product-form.constants';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe, Button, Message, Spinner, FormControlComponent, DynamicFormComponent, InputTextModule],
    templateUrl: './product-form.html',
    styleUrl: './product-form.css',
})
export class ProductFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly productsService = inject(ProductsService);
    private readonly translate = inject(TranslateService);
    private readonly subCategoriesStore = inject(SubCategoriesStore);

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

    readonly subCategories = computed(() => this.subCategoriesStore.entities());

    readonly discountTypeOptions = DISCOUNT_TYPE_OPTIONS.map((option) => ({
        ...option,
        title: this.translate.instant(option.title),
    }));

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
            required: false,
            validators: [Validators.maxLength(1000)],
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
            options: this.discountTypeOptions,
            optionLabel: 'title',
            optionValue: 'id',
        },
        {
            name: 'discountValue',
            type: 'number',
            label: 'ADMIN.PRODUCTS.FORM.DISCOUNT_VALUE',
            visibleWhen: (values: Record<string, unknown>) => !!values['discountType'],
            validators: [this.discountValueValidator.bind(this)],
        },
    ];

    readonly customForm = this.fb.group({
        categoryId: ['', Validators.required],
        subCategoryId: [''],
        occasionIds: this.fb.control<string[]>([]),
        cover: ['', Validators.required],
        gallery: this.fb.control<string[]>([], [this.galleryValidator.bind(this)]),
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
                    subCategoryId: value.subCategoryId ?? '',
                    occasionIds: value.occasionIds ?? [],
                    cover: value.cover ?? '',
                    gallery: value.gallery ?? [],
                });
                if (value.categoryId) {
                    this.subCategoriesStore.loadSubCategories(value.categoryId);
                }
            }
        });

        this.customForm.controls.categoryId.valueChanges.subscribe((categoryId) => {
            this.customForm.controls.subCategoryId.setValue('');
            this.subCategoriesStore.loadSubCategories(categoryId || undefined);
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
        const discountType = String(dynamicValues['discountType'] ?? '');
        const discountValue = dynamicValues['discountValue'] as number | null;
        const value: ProductFormValue = {
            title: String(dynamicValues['title'] ?? ''),
            description: String(dynamicValues['description'] ?? ''),
            price: dynamicValues['price'] as number | null,
            stock: dynamicValues['stock'] as number | null,
            cover: customValue.cover ?? '',
            gallery: customValue.gallery ?? [],
            categoryId: customValue.categoryId ?? '',
            occasionIds: customValue.occasionIds ?? [],
            ...(discountType ? { discountType, discountValue } : {}),
            ...(customValue.subCategoryId ? { subCategoryId: customValue.subCategoryId } : {}),
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

    private discountValueValidator(control: AbstractControl): Record<string, unknown> | null {
        const value = control.value;
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const num = Number(value);
        if (Number.isNaN(num) || num <= 0) {
            return { min: { min: 0.01, actual: value } };
        }

        const discountType = control.parent?.get('discountType')?.value;
        if (discountType === 'PERCENT' && num > 100) {
            return { maxPercent: { max: 100, actual: num } };
        }

        return null;
    }

    private extractUploadError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const error = err as { error?: { message?: string }; message?: string };
            return error.error?.message || error.message || 'ADMIN.PRODUCTS.UPLOAD_ERROR';
        }
        return 'ADMIN.PRODUCTS.UPLOAD_ERROR';
    }

    private compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(file);

            image.onload = () => {
                URL.revokeObjectURL(objectUrl);

                let width = image.width;
                let height = image.height;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                if (!context) {
                    resolve(file);
                    return;
                }
                context.drawImage(image, 0, 0, width, height);

                const outputType = file.type.startsWith('image/') ? file.type : 'image/jpeg';
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }
                        const compressed = new File([blob], file.name, {
                            type: outputType,
                            lastModified: file.lastModified,
                        });
                        resolve(compressed.size < file.size ? compressed : file);
                    },
                    outputType,
                    quality,
                );
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load image for compression'));
            };

            image.src = objectUrl;
        });
    }

    onCoverSelected(file: File | null): Promise<void> {
        if (!file) return Promise.resolve();

        this.isUploadingCover.set(true);
        this.uploadError.set(null);

        return new Promise((resolve) => {
            this.compressImage(file)
                .then((compressedFile) =>
                    this.productsService
                        .uploadImage(compressedFile)
                        .pipe(take(1), finalize(() => this.isUploadingCover.set(false)))
                        .subscribe({
                            next: (res) => {
                                this.customForm.controls.cover.setValue(res.url);
                                resolve();
                            },
                            error: (err: unknown) => {
                                this.uploadError.set(this.extractUploadError(err));
                                resolve();
                            },
                        }),
                )
                .catch((err: unknown) => {
                    this.isUploadingCover.set(false);
                    this.uploadError.set(this.extractUploadError(err));
                    resolve();
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
            Promise.all(filesToUpload.map((file) => this.compressImage(file).catch(() => file)))
                .then((compressedFiles) => {
                    const uploadResults = compressedFiles.map((file) =>
                        this.productsService
                            .uploadImage(file)
                            .pipe(take(1))
                            .toPromise()
                            .then((res) => ({ ok: true as const, url: res?.url }))
                            .catch((err: unknown) => ({ ok: false as const, error: this.extractUploadError(err) })),
                    );

                    Promise.all(uploadResults).then((results) => {
                        const validUrls = results
                            .filter((r) => r.ok && r.url)
                            .map((r) => (r as { ok: true; url: string }).url);
                        const firstError = results.find((r) => !r.ok)?.error;

                        this.customForm.controls.gallery.setValue([...currentGallery, ...validUrls]);
                        this.isUploadingGallery.set(false);

                        if (firstError) {
                            this.uploadError.set(
                                validUrls.length > 0 ? 'ADMIN.PRODUCTS.UPLOAD_PARTIAL_ERROR' : firstError,
                            );
                        }
                        resolve();
                    });
                })
                .catch((err: unknown) => {
                    this.isUploadingGallery.set(false);
                    this.uploadError.set(this.extractUploadError(err));
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
