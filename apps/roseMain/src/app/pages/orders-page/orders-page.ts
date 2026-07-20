import { Component, inject, OnInit } from '@angular/core';
import { OrderStore } from '@org/user-orders';

@Component({
  selector: 'app-orders-page',
  imports: [],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
})
export class OrdersPage implements OnInit {

  readonly _OrdersStore = inject(OrderStore);

  ngOnInit(): void {
    this._OrdersStore.loadOrders();
  }


}
