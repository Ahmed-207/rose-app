import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { PaginatorState, PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'lib-paginator',
  imports: [PaginatorModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
  // Disabled so plain CSS can target PrimeNG's internal paginator DOM.
  // Everything is scoped under .rose-paginator in the CSS so nothing leaks globally.
  encapsulation: ViewEncapsulation.None,
})
export class Paginator {
  pFirst = input.required<number>();
  pItemsPerPage = input.required<number>();
  pTotalItems = input.required<number>();
  pPageChange = output<number>();

  onPageChange(event: PaginatorState) {
    this.pPageChange.emit(event.page ?? 0);
  }
}
