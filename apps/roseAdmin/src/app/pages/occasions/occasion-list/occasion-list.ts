import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { DataTableColumn, DataTablePageEvent } from '../../../shared/data-table/data-table.model';
import { OccasionsService } from '../service/occasions.service';
import { Occasion } from '../models/occasion.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-occasion-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './occasion-list.html',
  styleUrl: './occasion-list.css',
})
export class OccasionListComponent implements OnInit {
  private readonly occasionsService = inject(OccasionsService);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastr = inject(ToastrService);

  occasions: Occasion[] = [];
  isLoading = false;
  totalRecords = 0;
  currentPage = 1;
  limit = 20;

  columns: DataTableColumn<Occasion>[] = [
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
  ];

  ngOnInit(): void {
    this.loadOccasions(this.currentPage, this.limit);
  }

  loadOccasions(page: number, limit: number): void {
    this.isLoading = true;
    this.occasionsService
      .getOccasionList(page, limit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.occasions = response.payload.data;
          this.totalRecords = response.payload.metadata.total;
          this.currentPage = response.payload.metadata.page;
          this.limit = response.payload.metadata.limit;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Failed to load occasions.');
        },
      });
  }

  onPageChange(event: DataTablePageEvent): void {
    this.loadOccasions(event.page, event.limit);
  }

  onEdit(row: Occasion): void {
    this.router.navigate(['/admin/occasions/edit', row.id]);
  }

  onDelete(row: Occasion): void {
    if (confirm('Are you sure you want to delete this occasion?')) {
      this.occasionsService
        .delete(row.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toastr.success('Occasion deleted successfully.');
            this.loadOccasions(this.currentPage, this.limit);
          },
          error: () => this.toastr.error('Could not delete occasion.'),
        });
    }
  }
}