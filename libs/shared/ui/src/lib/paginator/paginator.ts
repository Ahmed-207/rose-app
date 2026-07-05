import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  pFirst = input.required<number>();
  pItemsPerPage = input.required<number>();
  pTotalItems = input.required<number>();


  onPageChange(event: PaginatorState) {

    const page = (event.page ?? 0) + 1;
    this.updateURL({ page });

  }

  private updateURL(params: any): void {

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: 'merge'
    })

  }
}