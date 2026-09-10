import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AdminProductsStore,
    CategoriesStore,
    OccasionsStore,
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
    private readonly adminProductsStore = inject(AdminProductsStore);
    private readonly categoriesStore = inject(CategoriesStore);
    private readonly occasionsStore = inject(OccasionsStore);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly isSubmitting = computed(() => this.adminProductsStore.isSubmitting());
    readonly error = computed(() => this.adminProductsStore.submitError());

    readonly categories = computed(() => this.categoriesStore.entities());
    readonly occasions = computed(() => this.occasionsStore.entities());

    ngOnInit(): void {
        this.loadLookupData();
    }

    onSave(formValue: ProductFormValue): void {
        const payload = this.buildCreatePayload(formValue);

        this.adminProductsStore
            .addProduct(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/products']);
                },
            });
    }

    onCancel(): void {
        this.router.navigate(['/admin/products']);
    }

    private loadLookupData(): void {
        this.categoriesStore.loadOnce();
        this.occasionsStore.loadOnce();
    }

    private buildCreatePayload(formValue: ProductFormValue): CreateProductReq {
        const payload: CreateProductReq = {
            title: formValue.title,
            price: formValue.price ?? 0,
            stock: formValue.stock ?? 0,
            categoryId: formValue.categoryId,
        };

        if (formValue.description?.trim()) payload.description = formValue.description.trim();
        if (formValue.discountType) payload.discountType = formValue.discountType;
        if (formValue.discountValue != null) payload.discountValue = formValue.discountValue;
        if (formValue.cover) payload.cover = formValue.cover;
        if (formValue.gallery?.length) payload.gallery = formValue.gallery;
        if (formValue.occasionIds?.length) payload.occasionIds = formValue.occasionIds;

        return payload;
    }
}
