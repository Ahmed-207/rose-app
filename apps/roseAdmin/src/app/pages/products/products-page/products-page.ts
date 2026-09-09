import { Component, computed, DestroyRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';
import { AdminProductsStore, CategoriesStore, Product, FilterParams } from '@org/products';
import { Button, Message } from '@org/shared-ui-components';
import { DataTableComponent, DataTableColumn, DataTablePageEvent, DataTableSortEvent } from '../../../shared';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

type SortOrder = 'asc' | 'desc' | null;

@Component({
    selector: 'app-products-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslatePipe,
        Button,
        Message,
        DataTableComponent,
        InputTextModule,
        SelectModule,
        ConfirmDialogModule,
    ],
    templateUrl: './products-page.html',
    styleUrl: './products-page.css',
    encapsulation: ViewEncapsulation.None,
})
export class ProductsPage implements OnInit {
    private readonly adminProductsStore = inject(AdminProductsStore);
    private readonly categoriesStore = inject(CategoriesStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly translate = inject(TranslateService);

    readonly products = computed(() => this.adminProductsStore.entities());
    readonly totalRecords = computed(() => this.adminProductsStore.totalProducts());
    readonly isLoading = computed(() => this.adminProductsStore.isLoading());
    readonly error = computed(() => this.adminProductsStore.error());
    readonly submitError = computed(() => this.adminProductsStore.submitError());
    readonly page = signal<number>(1);
    readonly limit = signal<number>(10);
    readonly selectedCategoryId = signal<string | null>(null);
    readonly sortField = signal<string | null>(null);
    readonly sortOrder = signal<SortOrder>(null);
    readonly successMessage = signal<string | null>(null);

    readonly searchControl = new FormControl('', { nonNullable: true });

    readonly categories = computed(() => this.categoriesStore.entities());
    readonly categoryOptions = computed(() => [
        { label: this.translate.instant('ADMIN.PRODUCTS.ALL_CATEGORIES'), value: null },
        ...this.categories().map((category) => ({ label: category.title, value: category.id })),
    ]);

    readonly columns: DataTableColumn<Product>[] = [
        { field: 'title', header: 'ADMIN.PRODUCTS.NAME', sortable: true },
        { field: 'price', header: 'ADMIN.PRODUCTS.PRICE', sortable: true },
        { field: 'stock', header: 'ADMIN.PRODUCTS.STOCK', sortable: true },
        { field: '_count.cartItems', header: 'ADMIN.PRODUCTS.SALES', hiddenOnMobile: true },
        { field: 'rating', header: 'ADMIN.PRODUCTS.RATINGS', hiddenOnMobile: true, sortable: true },
        { field: 'createdAt', header: 'ADMIN.PRODUCTS.CREATED_AT', hiddenOnMobile: true, sortable: true },
    ];

    ngOnInit(): void {
        this.categoriesStore.loadOnce();
        this.readFiltersFromRoute(this.route.snapshot.queryParams);
        this.setupSearchDebounce();
        this.loadProducts();
        this.syncFiltersWithRoute();
    }

    private setupSearchDebounce(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                tap(() => {
                    this.page.set(1);
                    this.updateUrl({ replaceUrl: true });
                    this.loadProducts();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private buildFilters(): FilterParams {
        return {
            page: this.page(),
            limit: this.limit(),
            search: this.searchControl.value || undefined,
            categoryId: this.selectedCategoryId() ?? undefined,
            sortBy: this.sortField() ?? undefined,
            sortOrder: this.sortOrder() ?? undefined,
        };
    }

    loadProducts(): void {
        this.adminProductsStore.loadProducts(this.buildFilters());
    }

    onPageChange(event: DataTablePageEvent): void {
        this.page.set(event.page);
        this.limit.set(event.limit);
        this.updateUrl();
        this.loadProducts();
    }

    onCategoryChange(categoryId: string | null | undefined): void {
        this.selectedCategoryId.set(categoryId || null);
        this.page.set(1);
        this.updateUrl();
        this.loadProducts();
    }

    onSortChange(event: DataTableSortEvent): void {
        this.sortField.set(event.order ? event.field : null);
        this.sortOrder.set(event.order);
        this.page.set(1);
        this.updateUrl();
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
                this.adminProductsStore
                    .deleteProduct(product.id)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: () => {
                            this.successMessage.set('ADMIN.PRODUCTS.DELETE_SUCCESS');
                            this.loadProducts();
                        },
                        error: () => {
                            this.successMessage.set(null);
                        },
                    });
            },
        });
    }

    private syncFiltersWithRoute(): void {
        this.route.queryParams
            .pipe(
                filter((params) => !this.isSameRouteParams(params)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((params) => {
                this.readFiltersFromRoute(params);
                this.loadProducts();
            });
    }

    private readFiltersFromRoute(params: Record<string, unknown>): void {
        this.page.set(this.parseNumberParam(params['page'], 1));
        this.limit.set(this.parseNumberParam(params['limit'], 10));
        this.selectedCategoryId.set((params['categoryId'] as string | undefined) || null);
        this.sortField.set((params['sortBy'] as string | undefined) || null);
        const order = params['sortOrder'];
        this.sortOrder.set(order === 'asc' || order === 'desc' ? (order as SortOrder) : null);
        const search = (params['search'] as string | undefined) || '';
        this.searchControl.setValue(search, { emitEvent: false });
    }

    private parseNumberParam(value: unknown, fallback: number): number {
        const n = typeof value === 'string' ? parseInt(value, 10) : NaN;
        return Number.isNaN(n) ? fallback : n;
    }

    private getNormalizedQueryParams(params: Record<string, unknown>): Record<string, string> {
        return {
            page: String(this.parseNumberParam(params['page'], 1)),
            limit: String(this.parseNumberParam(params['limit'], 10)),
            search: (params['search'] as string | undefined) || '',
            categoryId: (params['categoryId'] as string | undefined) || '',
            sortBy: (params['sortBy'] as string | undefined) || '',
            sortOrder: (params['sortOrder'] as string | undefined) || '',
        };
    }

    private isSameRouteParams(params: Record<string, unknown>): boolean {
        const current = this.getNormalizedCurrentParams();
        const next = this.getNormalizedQueryParams(params);
        return Object.keys(current).every((key) => current[key] === next[key]);
    }

    private getNormalizedCurrentParams(): Record<string, string> {
        return {
            page: String(this.page()),
            limit: String(this.limit()),
            search: this.searchControl.value || '',
            categoryId: this.selectedCategoryId() || '',
            sortBy: this.sortField() || '',
            sortOrder: this.sortOrder() || '',
        };
    }

    private updateUrl({ replaceUrl = false } = {}): void {
        const queryParams: Record<string, string | number | null> = {
            page: this.page() === 1 ? null : this.page(),
            limit: this.limit() === 10 ? null : this.limit(),
            search: this.searchControl.value || null,
            categoryId: this.selectedCategoryId() || null,
            sortBy: this.sortField() || null,
            sortOrder: this.sortOrder() || null,
        };

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: 'merge',
            replaceUrl,
        });
    }
}
