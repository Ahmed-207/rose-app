import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-status',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './checkout-status.html',
  styleUrl: './checkout-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class checkoutStatus {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  status: boolean = false;
  orderId: String = '';
Msg: string = '';
  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
     this.orderId = params.get('orderId') || '';
    this.Msg = params.get('msg') || '';

      if (params.get('status') == 'success') {
        this.status = true;
      } else {
        this.status = false;
      }
    });
  }

  viewOrderDetails() {
    this.router.navigate(['/home/orders']);
  }
}
