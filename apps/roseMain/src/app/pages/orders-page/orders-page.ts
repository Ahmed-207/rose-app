import { CommonModule, DatePipe  } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderStore } from '@org/user-orders';

@Component({
  selector: 'app-orders-page',
  imports: [CommonModule , DatePipe , TranslatePipe],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
})
export class OrdersPage implements OnInit {

  readonly store = inject(OrderStore);

  expandedOrders = signal<Set<string>>(new Set());
  ngOnInit(): void {
    this.store.loadOrders();
  }

  toggleShowMore(orderId: string): void {
    this.expandedOrders.update((currentSet) => {
      const newSet = new Set(currentSet);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrders().has(orderId);
  }


}
