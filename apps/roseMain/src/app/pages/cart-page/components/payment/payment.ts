import { Component, OnInit, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-payment',
  imports: [TranslatePipe],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit {
  selectedMethod = signal<string>('CASH_ON_DELIVERY');
  selectedPaymentMethod = output<string>();
  backToShipping = output<void>();
  checkoutConfirmed = output<void>();

  ngOnInit(): void {
    this.selectedPaymentMethod.emit(this.selectedMethod());
  }

  onPaymentMethodChange(method: string): void {
    this.selectedMethod.set(method);
    this.selectedPaymentMethod.emit(method);
  }

  onBackClicked(): void {
    this.backToShipping.emit();
  }
  
  onCheckoutClicked(): void {
    this.checkoutConfirmed.emit();
  }
}