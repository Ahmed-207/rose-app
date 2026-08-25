import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderStore } from '@org/user-orders';

@Component({
  selector: 'app-checkout-status',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './checkout-status.html',
  styleUrl: './checkout-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutStatus implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderStore = inject(OrderStore);

  status = false;
  orderId = '';
  msg = '';
  isVerifying = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => this.resolveCheckoutStatus(params));
  }

  private resolveCheckoutStatus(params: ParamMap): void {
    const sessionId = params.get('session_id');

    if (sessionId) {
      this.isVerifying.set(true);
      this.orderStore.verifyCheckoutSession(sessionId);
      return;
    }

    this.isVerifying.set(false);
    this.orderId = params.get('orderId') || '';
    this.msg = params.get('msg') || '';
    this.status = params.get('status') === 'success';
  }

  viewOrderDetails(): void {
    this.router.navigate(['/home/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/home/products']);
  }

  backToCart(): void {
    this.router.navigate(['/home/cart']);
  }
}
