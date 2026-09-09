import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
    ProductsService,
    CategoriesStore,
    OccasionsStore,
    Product,
    UpdateProductReq,
} from '@org/products';
import { Message, Spinner } from '@org/shared-ui-components';
import { ProductFormComponent, ProductFormValue } from '../product-form';

@Component({
    selector: 'app-product-edit-page',
    standalone: true,
    imports: [CommonModule, TranslatePipe, Message, Spinner, ProductFormComponent],
    templateUrl: './product-edit-page.html',
    styleUrl: './product-edit-page.css',
})
export class ProductEditPage implements OnInit {
    private readonly productsService = inject(ProductsService);
    private readonly categoriesStore = inject(CategoriesStore);
    private readonly occasionsStore = inject(OccasionsStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    readonly productId = signal<string>('');
    readonly product = signal<Product | null>(null);
    readonly isLoading = signal<boolean>(false);
    readonly isSubmitting = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    readonly categories = computed(() => this.categoriesStore.entities());
    readonly occasions = computed(() => this.occasionsStore.entities());

    readonly initialValue = computed<ProductFormValue | null>(() => {
        const p = this.product();
        if (!p) return null;

        return {
            title: p.title,
            description: p.description,
            price: Number(p.price),
            stock: p.stock,
            discountType: p.discountType,
            discountValue: p.discountValue ? Number(p.discountValue) : null,
            cover: p.cover,
            gallery: this.parseGallery(p.gallery),
            categoryId: p.categoryId,
            subCategoryId: p.subCategoryId,
            occasionIds: Array.isArray(p.occasions)
                ? (p.occasions as { occasionId?: string; id?: string; occasion?: { id: string } }[])
                      .map((o) => o.occasionId ?? o.occasion?.id ?? o.id)
                      .filter((id): id is string => !!id)
                : [],
        };
    });

    ngOnInit(): void {
        this.resolveProductId();
        this.loadLookupData();
        this.loadProduct();
    }

    onSave(formValue: ProductFormValue): void {
        const id = this.productId();
        this.isSubmitting.set(true);
        this.error.set(null);

        const payload = this.buildUpdatePayload(formValue);

        this.productsService
            .updateProduct(id, payload)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isSubmitting.set(false)),
            )
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/products']);
                },
                error: (err: { message?: string }) => {
                    this.error.set(err.message ?? 'ADMIN.PRODUCTS.UPDATE_ERROR');
                },
            });
    }

    onCancel(): void {
        this.router.navigate(['/admin/products']);
    }

    private resolveProductId(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('ADMIN.PRODUCTS.INVALID_PRODUCT_ID');
            return;
        }
        this.productId.set(id);
    }

    private loadLookupData(): void {
        this.categoriesStore.loadOnce();
        this.occasionsStore.loadOnce();
    }

    private loadProduct(): void {
        const id = this.productId();
        if (!id) return;

        this.isLoading.set(true);
        this.productsService
            .getProductById(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isLoading.set(false)),
            )
            .subscribe({
                next: (res) => {
                    this.product.set(res.product);
                },
                error: (err: { message?: string }) => {
                    this.error.set(err.message ?? 'ADMIN.PRODUCTS.LOAD_PRODUCT_ERROR');
                },
            });
    }

    private parseGallery(gallery: unknown): string[] {
        if (Array.isArray(gallery)) return gallery as string[];
        if (typeof gallery === 'string') {
            try {
                const parsed = JSON.parse(gallery);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    }

    private buildUpdatePayload(formValue: ProductFormValue): UpdateProductReq {
        const payload: UpdateProductReq = {
            title: formValue.title,
            price: formValue.price ?? 0,
            stock: formValue.stock ?? 0,
            categoryId: formValue.categoryId,
        };

        if (formValue.description?.trim()) payload.description = formValue.description.trim();
        if (formValue.discountType) {
            payload.discountType = formValue.discountType;
            if (formValue.discountValue != null) payload.discountValue = formValue.discountValue;
        }
        if (formValue.cover) payload.cover = formValue.cover;
        if (formValue.gallery?.length) payload.gallery = formValue.gallery;
        if (formValue.occasionIds?.length) payload.occasionIds = formValue.occasionIds;

        return payload;
    }
}
