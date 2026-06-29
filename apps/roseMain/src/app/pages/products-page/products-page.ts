import { ProductsStore } from "@org/products";
import { Component, inject, OnInit } from '@angular/core';
import { ProductCard } from "@org/shared-ui-components";

@Component({
  selector: 'app-products-page',
  imports: [ProductCard],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  readonly _pStore = inject(ProductsStore);

  ngOnInit(): void {
    this._pStore.loadProducts({ pageNumber: 1, limit: 20 });
  }
}
