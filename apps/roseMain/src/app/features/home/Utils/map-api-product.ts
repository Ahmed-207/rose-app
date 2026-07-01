// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class MapApiProduct {
  
// }
import { Product as ApiProduct } from '@org/products';
import { Product, ProductBadge } from 'apps/shared/models/productDto';

function normalizeUrl(url: string): string {
  return url.trim().replace(/([^:]\/)\/+/g, '$1');
}
export function mapApiProductToCardProduct(apiProduct: ApiProduct): Product {
  const price = Number(apiProduct.price);
  const discount = Number(apiProduct.discountValue);
  let oldPrice: number | undefined;

  if (discount > 0 && discount < 100) {
    oldPrice = Math.round((price / (1 - discount / 100)) * 100) / 100;
  }

  const badges: ProductBadge[] = [];
  if (discount > 0) {
    badges.push('SALE');
  }
  if ((apiProduct._count?.cartItems ?? 0) >= 2) {
    badges.push('HOT');
  }

  const createdAt = new Date(apiProduct.createdAt);
  const isNew = Date.now() - createdAt.getTime() < 1000 * 60 * 60 * 24 * 30;
  if (isNew) {
    badges.unshift('NEW');
  }

  return {
    id: Number (apiProduct.id),
    name: apiProduct.title,
    image: apiProduct.cover ? normalizeUrl(apiProduct.cover) : '',
    price,
    oldPrice,
    rating: apiProduct.rating,
    isOutOfStock: apiProduct.stock <= 0,
    badges,
  };
}