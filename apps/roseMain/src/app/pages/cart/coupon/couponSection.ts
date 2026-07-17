import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CouponsService, ICoupon } from '@org/products';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-coupon-section',
  imports: [ FormsModule , CommonModule , TranslatePipe],
  templateUrl: './couponSection.html',
  styleUrl: './couponSection.css',
})
export class CouponSection {

  private readonly couponsService = inject(CouponsService);
  private destroyRef = inject(DestroyRef);


  // Signals
  couponCode = signal<string>(''); 
  appliedCoupon = signal<ICoupon | null>(null); 
  errorMessage = signal<string>(''); 
  
  // أسعار افتراضية للتجربة
  subtotal = 250; 
  discount = signal<number>(0);

  get total(): number {
    return this.subtotal - this.discount();
  }

  // applyCoupon() {
  //   const code = this.couponCode().trim();
  //   if (!code) return;

  //   this.errorMessage.set(''); 

  //   this.couponsService.getCouponById(code).subscribe({
  //     next: (response) => {
  //       const coupon = response.data;
  //       this.appliedCoupon.set(coupon);
        
  //       this.discount.set(coupon.discount); 
  //     },
  //     error: (err) => {
  //       this.appliedCoupon.set(null);
  //       this.discount.set(0);
  //       this.errorMessage.set('كوبون الخصم غير صحيح أو منتهي الصلاحية!');
  //     }
  //   });
  // }


applyCoupon() {
  const code = this.couponCode().trim();
  if (!code) return;

  this.errorMessage.set('');

  this.couponsService.getAllCoupons(1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({
    next: (response: any) => {
      const couponsList = response?.payload?.data || []; 
      
      const foundCoupon = couponsList.find((c: any) => c.code === code);

      if (foundCoupon) {
        this.appliedCoupon.set(foundCoupon);
        
        const couponValue = Number(foundCoupon.value);
        if (foundCoupon.type === 'PERCENT') {
          const calculatedDiscount = (this.subtotal * couponValue) / 100;
          this.discount.set(calculatedDiscount);
        } else {
          this.discount.set(couponValue);
        }
        
        this.errorMessage.set('');
      } else {
        this.resetCoupon('CART_SUMMARY.ERRORS.INVALID_COUPON');
        
      }
    },
    error: (err) => {
      
      this.resetCoupon('');
    }
  });
}


private resetCoupon(msgKey: string) {
  this.appliedCoupon.set(null);
  this.discount.set(0);
  if (msgKey) this.errorMessage.set(msgKey);}
}
