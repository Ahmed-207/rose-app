import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Button, Message } from '@org/shared-ui-components';
import { DataTableComponent, DataTableColumn, DataTablePageEvent } from '../../shared';
import { Category } from './models/category.models';
import { CategoriesService } from './service/categories.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    Message,
    DataTableComponent,
    InputTextModule,
    TranslatePipe,
    ConfirmDialogModule,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryListComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<Category[]>([]);
  readonly totalRecords = signal(0);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly columns: DataTableColumn<Category>[] = [
    { field: 'title', header: 'Name' },
    { field: 'description', header: 'Description' },
    { field: '_count.products', header: 'Products' },
    { field: 'createdAt', header: 'Created At', hiddenOnMobile: true },
  ];

  ngOnInit(): void {
    this.setupSearch();
    this.syncFiltersWithRoute();
  }

  onAddCategory(): void {
    this.router.navigate(['/admin/categories/new']);
  }

  onEditCategory(category: Category): void {
    this.router.navigate(['/admin/categories', category.id, 'edit']);
  }

  onPageChange(event: DataTablePageEvent): void {
    if (this.page() === event.page && this.limit() === event.limit) {
      return;
    }

    this.page.set(event.page);
    this.limit.set(event.limit);
    this.updateUrl();
  }

  onDeleteCategory(category: Category): void {
    this.confirmationService.confirm({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${category.title}"?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoriesService
          .delete(category.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.successMessage.set('Category deleted successfully.');
              this.loadCategories();
            },
            error: (error: unknown) => {
              this.errorMessage.set(error instanceof Error ? error.message : 'Could not delete the category.');
            },
          });
      },
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.updateUrl(true);
      });
  }

  private syncFiltersWithRoute(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.page.set(this.parseNumberParam(params['page'], 1));
        this.limit.set(this.parseNumberParam(params['limit'], 10));
        this.searchControl.setValue((params['search'] as string | undefined) || '', { emitEvent: false });
        this.loadCategories();
      });
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.categoriesService
      .getCategoryList(this.page(), this.limit(), this.searchControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categories.set(response.data);
          this.totalRecords.set(response.metadata.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Could not load categories.');
        },
      });
  }

  private parseNumberParam(value: unknown, fallback: number): number {
    const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN;
    return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
  }

  private updateUrl(replaceUrl = false): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page(),
        limit: this.limit(),
        search: this.searchControl.value || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
