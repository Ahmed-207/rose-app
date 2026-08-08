export interface CreateIntentReq {
    orderId: string;
}

export interface CreateIntentRes {
    payload: {
        paymentIntentId: string;
        clientSecret: string;
    };
}

export interface ConfirmPaymentReq {
    paymentIntentId: string;
    paymentMethodId: string;
}

export interface ConfirmPaymentRes {
    payload: {
        paymentIntent: {
            id: string;
            status: string;
            clientSecret: string;
        };
        order: {
            id: string;
            paymentStatus: string;
        };
    };
}
