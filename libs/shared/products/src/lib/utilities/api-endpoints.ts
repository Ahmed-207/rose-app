export const CATEGORY = {
    getCategories: 'categories',
} as const;

export const OCCASION = {
    getOccasions: 'occasions',
} as const;

export const PRODUCT = {
    getProducts: 'products',
} as const;

export const REVIEW = {
    getReviews: 'reviews',
    createReview: 'reviews',
} as const;

export const CART = {
    getCart: 'cart',
    clearCart: 'cart',
    item: (id: string) => `cart/${id}`,
} as const;

export const COUPON = {
    getCoupons: 'coupons',
    getCoupon: (id: string) => `coupons/${id}`,
} as const;

