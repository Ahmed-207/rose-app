import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button, Message, Spinner } from '@org/shared-ui-components';
import { DataTableColumn, DataTablePageEvent } from './data-table.model';

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule, TableModule, Button, Message, Spinner],
    templateUrl: './data-table.component.html',
    styleUrl: './data-table.component.css',
    encapsulation: ViewEncapsulation.None,
})
export class DataTableComponent<T = unknown> {
    columns = input.required<DataTableColumn<T>[]>();
    data = input.required<T[]>();
    totalRecords = input.required<number>();
    loading = input<boolean>(false);
    error = input<string | null>(null);
    page = input<number>(1);
    limit = input<number>(10);

    pageChange = output<DataTablePageEvent>();
    editRow = output<T>();
    deleteRow = output<T>();

    readonly firstRowIndex = computed(() => (this.page() - 1) * this.limit());

    onPageChange(event: { first: number; rows: number }): void {
        this.pageChange.emit({
            page: Math.floor(event.first / event.rows) + 1,
            limit: event.rows,
        });
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
}
