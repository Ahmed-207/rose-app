import { ProductsStore } from "@org/products";
import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SlicePipe } from "@angular/common";

@Component({
  selector: 'app-products-page',
  imports: [CardModule, ButtonModule, SlicePipe],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  readonly _pStore = inject(ProductsStore);

  ngOnInit(): void {
    this._pStore.loadProducts({ pageNumber: 1, limit: 20 });
  }
}
