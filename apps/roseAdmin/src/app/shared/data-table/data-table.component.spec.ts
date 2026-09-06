import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { DataTableColumn, DataTablePageEvent } from './data-table.model';

interface TestRow {
    id: string;
    name: string;
    price: number;
}

@Component({
    standalone: true,
    imports: [DataTableComponent],
    template: `
        <app-data-table
            [columns]="columns()"
            [data]="data()"
            [totalRecords]="totalRecords()"
            [loading]="loading()"
            [error]="error()"
            [page]="page()"
            [limit]="limit()"
            (pageChange)="lastPageChange.set($event)"
            (editRow)="lastEdit.set($event)"
            (deleteRow)="lastDelete.set($event)" />
    `,
})
class TestHost {
    table = viewChild.required(DataTableComponent);
    columns = signal<DataTableColumn<TestRow>[]>([
        { field: 'name', header: 'Name' },
        { field: 'price', header: 'Price' },
    ]);
    data = signal<TestRow[]>([
        { id: '1', name: 'Rose', price: 10 },
        { id: '2', name: 'Lily', price: 15 },
    ]);
    totalRecords = signal<number>(2);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    page = signal<number>(1);
    limit = signal<number>(10);

    lastPageChange = signal<DataTablePageEvent | null>(null);
    lastEdit = signal<TestRow | null>(null);
    lastDelete = signal<TestRow | null>(null);
}

describe('DataTableComponent', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(host.table()).toBeTruthy();
    });

    it('should render header cells', () => {
        const headers = fixture.nativeElement.querySelectorAll('th');
        expect(headers.length).toBe(3);
        expect(headers[0].textContent).toContain('Name');
        expect(headers[1].textContent).toContain('Price');
        expect(headers[2].textContent).toContain('Actions');
    });

    it('should render body cells from data', () => {
        const cells = fixture.nativeElement.querySelectorAll('td');
        expect(cells.length).toBeGreaterThan(0);
        expect(cells[0].textContent).toContain('Rose');
        expect(cells[1].textContent).toContain('10');
    });

    it('should emit editRow when Edit is clicked', () => {
        const editButton = fixture.nativeElement.querySelector('lib-button[arialabel="Edit"] button');
        editButton.click();

        expect(host.lastEdit()).toEqual(host.data()[0]);
    });

    it('should emit deleteRow when Delete is clicked', () => {
        const deleteButton = fixture.nativeElement.querySelector('lib-button[arialabel="Delete"] button');
        deleteButton.click();

        expect(host.lastDelete()).toEqual(host.data()[0]);
    });

    it('should show spinner when loading', () => {
        host.loading.set(true);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('lib-spinner')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('p-table')).toBeFalsy();
    });

    it('should show error message when error is set', () => {
        host.error.set('Network error');
        fixture.detectChanges();

        const message = fixture.nativeElement.querySelector('lib-message');
        expect(message).toBeTruthy();
    });

    it('should show empty message when data is empty', () => {
        host.data.set([]);
        host.totalRecords.set(0);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No records found');
    });
});
