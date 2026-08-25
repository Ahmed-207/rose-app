import { CheckoutSession } from './payment';

// ==========================================
// Base Entity Models
// ==========================================

export interface User {
    id: string;
    username: string;
    email: string;
}

export interface Address {
    id: string;
    userId: string;
    title: string;
    isPrimary: boolean;
    city: string;
    street: string;
    phone: string;
    latitude: string;
    longitude: string;
    createdAt: string;
    updatedAt: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: string;
    value: string;
    minPurchase: string;
    maxDiscount: string;
    usageLimit: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    immutable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    title: string;
    cover: string;
    description?: string;
    rating?: number;
    ratings?: number;
    stock?: number;
    price?: string;
    discountType?: string;
    discountValue?: string;
    gallery?: string;
    categoryId?: string;
    subCategoryId?: string;
    immutable?: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: string;
    createdAt: string;
    product: Product;
}

export interface Order {
    id: string;
    userId: string;
    addressId: string;
    couponId?: string | null;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    stripePaymentIntentId?: string | null;
    subtotal: string;
    discount: string;
    shipping: string;
    total: string;
    trackingNumber?: string | null;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItem[];
    user?: User;
    address?: Address;
    coupon?: Coupon | null;
}

export interface Metadata {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ==========================================
// API Request & Response Payload Interfaces
// ==========================================

export interface AddOrderReq {
    addressId: string;
    paymentMethod: string;
    couponCode?: string;
    notes?: string;
    successUrl?: string;
    cancelUrl?: string;
}

export interface AddOrderPayload {
    order: Order;
    checkout?: CheckoutSession | null;
}

export interface AddOrderRes {
    status: boolean;
    code: number;
    payload: AddOrderPayload;
}

export interface GetOrderPayload {
    data: Order[];
    metadata: Metadata;
}

export interface GetOrdersRes {
    status: boolean;
    code: number;
    payload: GetOrderPayload;
}