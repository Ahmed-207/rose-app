import { TemplateRef } from '@angular/core';

export interface DataTableColumn<T = unknown> {
    /** Object key to read the cell value, or a custom identifier when using a cell template. */
    field: keyof T | string;
    /** Header text shown in the table header. */
    header: string;
    /** Optional CSS width class (e.g. `w-32`, `min-w-[200px]`). */
    width?: string;
    /** Optional template used to render the cell content. Receives the row as `$implicit`. */
    cellTemplate?: TemplateRef<{ $implicit: T }>;
    /** When true, the column is hidden on mobile screens. */
    hiddenOnMobile?: boolean;
    /** When true, the column can be sorted and will emit sortChange events. */
    sortable?: boolean;
}

export interface DataTablePageEvent {
    page: number;
    limit: number;
}

export interface DataTableSortEvent {
    field: string;
    order: 'asc' | 'desc' | null;
}
