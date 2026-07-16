export type ProductBadge = 'HOT' | 'NEW' | 'SALE' ;
export interface Product {
 _id?: string;
  id: string ;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  isWishlist?: boolean;
  isOutOfStock?: boolean;
  badges?: ProductBadge[];
}

