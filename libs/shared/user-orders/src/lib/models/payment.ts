// =============================================================================
// New Stripe Checkout Session flow
// =============================================================================

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
  expiresAt: string;
  reused: boolean;
}

export interface CreateCheckoutSessionReq {
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionRes {
  payload: CheckoutSession;
}

export interface CheckoutSessionOrder {
  orderId: string;
  paymentStatus: string;
}

export interface CheckoutSessionStatus {
  sessionId: string;
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
  sessionStatus: 'open' | 'complete' | 'expired';
  amountTotal: number | null;
  currency: string | null;
  order: CheckoutSessionOrder | null;
}

export interface GetCheckoutSessionStatusRes {
  payload: CheckoutSessionStatus;
}

// =============================================================================
// Legacy Stripe Payment Intent flow — kept for reference only.
// Replaced by the checkout-session workflow above.
// =============================================================================

// export interface CreateIntentReq {
//     orderId: string;
// }

// export interface CreateIntentRes {
//     payload: {
//         paymentIntentId: string;
//         clientSecret: string;
//     };
// }

// export interface ConfirmPaymentReq {
//     paymentIntentId: string;
//     paymentMethodId: string;
// }

// export interface ConfirmPaymentRes {
//     payload: {
//         paymentIntent: {
//             id: string;
//             status: string;
//             clientSecret: string;
//         };
//         order: {
//             id: string;
//             paymentStatus: string;
//         };
//     };
// }
