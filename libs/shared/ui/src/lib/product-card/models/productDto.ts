export type ProductBadge = 'HOT' | 'NEW' | 'SALE';
export interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    oldPrice?: number;
    rating?: number;
    ratings?:number;
    isWishlist?: boolean;
    isOutOfStock?: boolean;
    badges?: ProductBadge[];
}