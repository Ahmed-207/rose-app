export type ProductBadge = 'HOT' | 'NEW' | 'SALE' ;
export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  isWishlist?: boolean;
  isOutOfStock?: boolean;
  badges?: ProductBadge[];
}

