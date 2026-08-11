import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // EDITED: Removed RouterLink import
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-status',
  standalone: true,
  imports: [CommonModule, TranslatePipe], // EDITED: Removed RouterLink from imports array
  templateUrl: './checkout-status.html',
  styleUrl: './checkout-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutStatus implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  status: boolean = false;
  orderId: string = '';
  msg: string = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.orderId = params.get('orderId') || '';
      this.msg = params.get('msg') || '';
      this.status = params.get('status') === 'success';
    });
  }

  /**
   * PROGRAMMATIC ROUTING METHODS
   */

  // 1. Programmatically navigates to the Orders page
  viewOrderDetails(): void {
    this.router.navigate(['/home/orders']);
  }

  // 2. Programmatically navigates to the Products catalog
  continueShopping(): void {
    this.router.navigate(['/home/products']);
  }

  // 3. Programmatically navigates back to the Cart
  backToCart(): void {
    this.router.navigate(['/home/cart']);
  }
}