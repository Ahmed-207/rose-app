
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { DataTableColumn, DataTablePageEvent } from '../../../shared/data-table/data-table.model';
import { OccasionsService } from '../service/occasions.service';
import { Occasion } from '../models/occasion.models';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/shared-ui-components';
import { ConfirmDialog } from 'apps/shared/components/confirm-dialog/confirmDialog';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-occasion-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, TranslatePipe, Button, ConfirmDialog, InputTextModule],
  templateUrl: './occasion-list.html',
  styleUrl: './occasion-list.css',
})
export class OccasionListComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly occasionsService = inject(OccasionsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastr = inject(ToastrService);

  occasions: Occasion[] = [];
  isLoading = false;
  totalRecords = 0;
  currentPage = 1;
  limit = 10;
  readonly occasionToDelete = signal<Occasion | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });

  columns: DataTableColumn<Occasion>[] = [
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'createdAt', header: 'Created At', hiddenOnMobile: true },
  ];

  ngOnInit(): void {
    this.setupSearch();
    this.syncFiltersWithRoute();
  }

  onAddOccasion(): void {
    this.router.navigate(['/admin/occasions/add']);
  }

  onEdit(row: Occasion): void {
    this.router.navigate(['/admin/occasions', row.id, 'edit']);
  }

  onDelete(row: Occasion): void {
    this.occasionToDelete.set(row);
  }

  onCancelDelete(): void {
    this.occasionToDelete.set(null);
  }

  onConfirmDelete(): void {
    const occasion = this.occasionToDelete();
    if (!occasion) {
      return;
    }

    this.occasionsService
      .delete(occasion.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.occasionToDelete.set(null);
          this.toastr.success('Occasion deleted successfully.');
          this.loadOccasions();
        },
        error: () => this.toastr.error('Could not delete occasion.'),
      });
  }

  onPageChange(event: DataTablePageEvent): void {
    if (this.currentPage === event.page && this.limit === event.limit) {
      return;
    }
    this.currentPage = event.page;
    this.limit = event.limit;
    this.updateUrl();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage = 1;
        this.updateUrl(true);
      });
  }

  private syncFiltersWithRoute(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.currentPage = this.parseNumberParam(params['page'], 1);
        this.limit = this.parseNumberParam(params['limit'], 10);
        this.searchControl.setValue((params['search'] as string | undefined) || '', { emitEvent: false });
        this.loadOccasions();
      });
  }

  private loadOccasions(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.occasionsService
      .getOccasionList(this.currentPage, this.limit, this.searchControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const dataContainer = response?.payload || response;
          this.occasions = dataContainer?.data || [];
          this.totalRecords = dataContainer?.metadata?.total || 0;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Failed to load occasions.');
          this.cdr.detectChanges();
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
        page: this.currentPage,
        limit: this.limit,
        search: this.searchControl.value || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
