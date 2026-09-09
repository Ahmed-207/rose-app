import { Component, computed, inject, input, output, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button, Message, Spinner } from '@org/shared-ui-components';
import { MenuItem } from 'primeng/api';
import { DataTableColumn, DataTablePageEvent, DataTableSortEvent } from './data-table.model';

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule, TableModule, MenuModule, TranslatePipe, Button, Message, Spinner],
    templateUrl: './data-table.component.html',
    styleUrl: './data-table.component.css',
    encapsulation: ViewEncapsulation.None,
})
export class DataTableComponent<T = unknown> {
    private readonly translate = inject(TranslateService);

    columns = input.required<DataTableColumn<T>[]>();
    data = input.required<T[]>();
    totalRecords = input.required<number>();
    loading = input<boolean>(false);
    error = input<string | null>(null);
    page = input<number>(1);
    limit = input<number>(10);

    pageChange = output<DataTablePageEvent>();
    sortChange = output<DataTableSortEvent>();
    editRow = output<T>();
    deleteRow = output<T>();

    readonly firstRowIndex = computed(() => {
        const pageNum = this.page() > 0 ? this.page() : 1;
        return (pageNum - 1) * this.limit();
    });

    readonly currentSort = signal<DataTableSortEvent | null>(null);

    onLazyLoad(event: TableLazyLoadEvent): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? this.limit();
        const calculatedPage = Math.floor(first / rows) + 1;

        if (calculatedPage !== this.page() || rows !== this.limit()) {
            this.pageChange.emit({
                page: calculatedPage,
                limit: rows,
            });
        }

        if (event.sortField) {
            const field = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
            const order = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : null;
            this.sortChange.emit({ field, order });
        }
    }

    fieldName(col: DataTableColumn<T>): string {
        return String(col.field);
    }

    resolveField(row: T, field: keyof T | string): unknown {
        if (row == null) {
            return '';
        }

        if (typeof field === 'string' && field.includes('.')) {
            return field.split('.').reduce<unknown>((acc, key) => {
                if (acc && typeof acc === 'object') {
                    return (acc as Record<string, unknown>)[key];
                }
                return '';
            }, row);
        }

        return (row as Record<string, unknown>)[field as string] ?? '';
    }

    actionMenuItems(row: T): MenuItem[] {
        return [
            {
                label: this.translate.instant('ADMIN.DATA_TABLE.EDIT'),
                icon: 'pi pi-pencil',
                command: () => this.editRow.emit(row),
            },
            {
                label: this.translate.instant('ADMIN.DATA_TABLE.DELETE'),
                icon: 'pi pi-trash',
                command: () => this.deleteRow.emit(row),
            },
        ];
    }
}