import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
    ProductsService,
    CategoriesStore,
    OccasionsStore,
    SubCategoriesStore,
    CreateProductReq,
} from '@org/products';
import { Message } from '@org/shared-ui-components';
import { ProductFormComponent, ProductFormValue } from '../product-form';

@Component({
    selector: 'app-product-create-page',
    standalone: true,
    imports: [CommonModule, TranslatePipe, Message, ProductFormComponent],
    templateUrl: './product-create-page.html',
    styleUrl: './product-create-page.css',
})
export class ProductCreatePage implements OnInit {
    private readonly productsService = inject(ProductsService);
    private readonly categoriesStore = inject(CategoriesStore);
    private readonly occasionsStore = inject(OccasionsStore);
    private readonly subCategoriesStore = inject(SubCategoriesStore);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly isSubmitting = signal(false);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

    readonly categories = computed(() => this.categoriesStore.entities());
    readonly occasions = computed(() => this.occasionsStore.entities());
    readonly subCategories = computed(() => this.subCategoriesStore.entities());

    ngOnInit(): void {
        this.categoriesStore.loadOnce();
        this.occasionsStore.loadOnce();
    }

    onCategoryChange(categoryId: string | null): void {
        if (categoryId) {
            this.subCategoriesStore.loadSubCategories(categoryId);
        } else {
            this.subCategoriesStore.reset();
        }
    }

    onSave(formValue: ProductFormValue): void {
        this.isSubmitting.set(true);
        this.error.set(null);

        const payload = this.buildCreatePayload(formValue);

        this.productsService
            .createProduct(payload)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isSubmitting.set(false)),
            )
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/products']);
                },
                error: (err: { message?: string }) => {
                    this.error.set(err.message ?? 'ADMIN.PRODUCTS.CREATE_ERROR');
                },
            });
    }

    onCancel(): void {
        this.router.navigate(['/admin/products']);
    }

    private buildCreatePayload(formValue: ProductFormValue): CreateProductReq {
        const payload: CreateProductReq = {
            title: formValue.title,
            price: formValue.price ?? 0,
            stock: formValue.stock ?? 0,
            categoryId: formValue.categoryId,
        };

        if (formValue.description?.trim()) payload.description = formValue.description.trim();
        if (formValue.subCategoryId) payload.subCategoryId = formValue.subCategoryId;
        if (formValue.discountType) payload.discountType = formValue.discountType;
        if (formValue.discountValue != null) payload.discountValue = formValue.discountValue;
        if (formValue.cover) payload.cover = formValue.cover;
        if (formValue.gallery?.length) payload.gallery = formValue.gallery;
        if (formValue.occasionIds?.length) payload.occasionIds = formValue.occasionIds;

        return payload;
    }
}
