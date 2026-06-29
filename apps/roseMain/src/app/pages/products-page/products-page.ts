import { ProductsStore } from "@org/products";
import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductCard, Spinner } from "@org/shared-ui-components";
import { ActivatedRoute, Router } from "@angular/router";
import { PaginatorState, Paginator, PaginatorModule } from 'primeng/paginator';


@Component({
  selector: 'app-products-page',
  imports: [ProductCard, PaginatorModule, Spinner],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  readonly _pStore = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  currentPage = signal<number>(1);
  first = signal<number>(0);
  productsPerPage = signal<number>(4);


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

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const page = params['page'] ? parseInt(params['page']) : 1;

      this.currentPage.set(page);
      this.first.set((page - 1) * this.productsPerPage());
      this._pStore.loadProducts({ pageNumber: this.currentPage(), limit: this.productsPerPage() });
    });
  }



}
