import { Product } from '@org/products';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface CartRes {
  status: boolean;
  code: number;
  message?: string;
  payload: {
    cartItems: CartItem[];
  };
}

export interface CartItemRes {
  status: boolean;
  code: number;
  message?: string;
  payload: {
    cartItem: CartItem;
  };
}

export interface AddToCartReq {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemReq {
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED' | string;
  value: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface CouponsRes {
  status: boolean;
  code: number;
  payload: {
    data: Coupon[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
}
