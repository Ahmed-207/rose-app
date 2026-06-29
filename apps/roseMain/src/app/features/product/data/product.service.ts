import { Injectable } from '@angular/core';
import { Product } from 'apps/shared/models/productDto';
import { ProductDetail } from 'apps/shared/models/productDetailDto';

const PRODUCT_IMAGE = '/assets/images/product.png';

const PRODUCT_DETAILS: ProductDetail[] = [
  {
    id: 1,
    name: 'Dreamy White Roses Bouquet',
    image: PRODUCT_IMAGE,
    images: Array.from({ length: 5 }, () => PRODUCT_IMAGE),
    price: 199.5,
    oldPrice: 320,
    rating: 4.5,
    badges: ['NEW'],
    stockCount: 265,
    reviewCount: 8,
    description:
      'This dreamy bouquet of white roses is the perfect way to show your love and appreciation. The soft, delicate petals and elegant arrangement make it a timeless gift for any occasion — from anniversaries to heartfelt surprises.',
    reviews: [
      {
        id: 1,
        author: 'Adrian',
        date: 'Apr 7, 2025',
        rating: 4.5,
        title: 'Awesome Bouquet!',
        content:
          'The bouquet was even more beautiful in person. Fresh flowers, elegant wrapping, and delivered right on time. Highly recommend for any special occasion.',
      },
      {
        id: 2,
        author: 'Sara',
        date: 'Mar 22, 2025',
        rating: 5,
        title: 'Perfect gift',
        content:
          'Bought this for my mom and she absolutely loved it. The roses looked fresh and the presentation was stunning.',
      },
    ],
  },
  {
    id: 2,
    name: 'Fuchsia Brilliance Vase',
    image: PRODUCT_IMAGE,
    images: Array.from({ length: 5 }, () => PRODUCT_IMAGE),
    price: 199,
    oldPrice: 280,
    rating: 3,
    isOutOfStock: true,
    stockCount: 0,
    reviewCount: 5,
    description:
      'A vibrant vase arrangement featuring brilliant fuchsia roses that bring energy and warmth to any room.',
    reviews: [],
  },
  {
    id: 3,
    name: 'Moko Chocolate Set | Esperance...',
    image: PRODUCT_IMAGE,
    images: Array.from({ length: 5 }, () => PRODUCT_IMAGE),
    price: 320,
    oldPrice: 400,
    rating: 4,
    badges: ['HOT'],
    isOutOfStock: true,
    stockCount: 0,
    reviewCount: 12,
    description:
      'An indulgent chocolate gift set paired with elegant floral accents — the perfect treat for someone special.',
    reviews: [],
  },
  {
    id: 4,
    name: 'Classic Red Roses Box',
    image: PRODUCT_IMAGE,
    images: Array.from({ length: 5 }, () => PRODUCT_IMAGE),
    price: 275,
    oldPrice: 330,
    rating: 5,
    badges: ['SALE'],
    stockCount: 142,
    reviewCount: 21,
    description:
      'Classic red roses presented in a premium gift box — a timeless expression of love and admiration.',
    reviews: [],
  },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts(): Product[] {
    return PRODUCT_DETAILS.map(({ reviews, description, images, stockCount, reviewCount, ...product }) => product);
  }

  getProductById(id: number): ProductDetail | undefined {
    return PRODUCT_DETAILS.find((product) => product.id === id);
  }
}
