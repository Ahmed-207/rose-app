import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs';
import { ProductsService, CategoriesStore, Product, FilterParams } from '@org/products';
import { Button, Message } from '@org/shared-ui-components';
import { DataTableComponent, DataTableColumn, DataTablePageEvent } from '../../../shared';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-products-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslatePipe,
        Button,
        Message,
        DataTableComponent,
        InputTextModule,
        ConfirmDialogModule,
    ],
    templateUrl: './products-page.html',
    styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
    private readonly productsService = inject(ProductsService);
    private readonly categoriesStore = inject(CategoriesStore);
    private readonly router = inject(Router);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);

    readonly products = signal<Product[]>([]);
    readonly totalRecords = signal<number>(0);
    readonly isLoading = signal<boolean>(false);
    readonly error = signal<string | null>(null);
    readonly page = signal<number>(1);
    readonly limit = signal<number>(10);
    readonly selectedCategoryId = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

    readonly searchControl = new FormControl('', { nonNullable: true });

    readonly categories = computed(() => this.categoriesStore.entities());

    readonly columns: DataTableColumn<Product>[] = [
        { field: 'title', header: 'ADMIN.PRODUCTS.NAME' },
        { field: 'price', header: 'ADMIN.PRODUCTS.PRICE' },
        { field: 'stock', header: 'ADMIN.PRODUCTS.STOCK' },
        { field: '_count.cartItems', header: 'ADMIN.PRODUCTS.SALES', hiddenOnMobile: true },
        { field: 'rating', header: 'ADMIN.PRODUCTS.RATINGS', hiddenOnMobile: true },
    ];

    ngOnInit(): void {
        this.categoriesStore.loadOnce();
        this.setupSearchDebounce();
        this.loadProducts();
    }

    private setupSearchDebounce(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                tap(() => this.page.set(1)),
                switchMap(() => {
                    this.isLoading.set(true);
                    return this.fetchProducts();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private fetchProducts() {
        const filters: FilterParams = {
            page: this.page(),
            limit: this.limit(),
            search: this.searchControl.value || undefined,
            categoryId: this.selectedCategoryId() ?? undefined,
        };

        return this.productsService.getAllProducts(filters).pipe(
            tap({
                next: (res) => {
                    this.products.set(res.data ?? []);
                    this.totalRecords.set(res.metadata?.total ?? 0);
                    this.error.set(null);
                },
                error: (err: { message?: string }) => {
                    this.error.set(err.message ?? 'ADMIN.PRODUCTS.LOAD_ERROR');
                    this.products.set([]);
                    this.totalRecords.set(0);
                },
            }),
            finalize(() => this.isLoading.set(false)),
        );
    }

    loadProducts(): void {
        this.isLoading.set(true);
        this.fetchProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }

    onPageChange(event: DataTablePageEvent): void {
        this.page.set(event.page);
        this.limit.set(event.limit);
        this.loadProducts();
    }

    onCategoryChange(categoryId: string | null): void {
        this.selectedCategoryId.set(categoryId);
        this.page.set(1);
        this.loadProducts();
    }

    onAddProduct(): void {
        this.router.navigate(['/admin/products/create']);
    }

    onEditProduct(product: Product): void {
        this.router.navigate(['/admin/products', product.id, 'edit']);
    }

    onDeleteProduct(product: Product): void {
        this.confirmationService.confirm({
            message: 'ADMIN.PRODUCTS.DELETE_CONFIRM_MESSAGE',
            header: 'ADMIN.PRODUCTS.DELETE_CONFIRM_TITLE',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'ADMIN.PRODUCTS.DELETE_CONFIRM_ACCEPT',
            rejectLabel: 'ADMIN.PRODUCTS.DELETE_CONFIRM_REJECT',
            accept: () => {
                this.productsService
                    .deleteProduct(product.id)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: () => {
                            this.successMessage.set('ADMIN.PRODUCTS.DELETE_SUCCESS');
                            this.loadProducts();
                        },
                        error: (err: { message?: string }) => {
                            this.error.set(err.message ?? 'ADMIN.PRODUCTS.DELETE_ERROR');
                        },
                    });
            },
        });
    }
}
