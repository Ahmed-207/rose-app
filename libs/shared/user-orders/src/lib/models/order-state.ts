export interface OrderState {
    isLoading: boolean;
    error: string | null;
    totalResults: number;
     isPaymentLoading: boolean;
    paymentError: string | null;
    paymentIntentId: string | null;
    paymentStatus: 'idle' | 'succeeded' | 'failed'
}



