import { Product } from '@org/shared-ui-components';

export interface ProductReview {
  id: string | number;
  author: string;
  date: string;
  rating: number;
  title: string;
  content: string;
}

export interface ProductDetail extends Product {
  description: string;
  images: string[];
  stockCount: number;
  reviewCount: number;
  reviews: ProductReview[];
}
