import { Product as ApiProduct, Review as ApiReview } from '@org/products';
import { Product, ProductBadge } from 'apps/shared/models/productDto';
import { ProductDetail, ProductReview } from 'apps/shared/models/productDetailDto';

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
  if ((apiProduct._count?.cartItems ?? 0) >= 2) {
    badges.push('HOT');
  }

  const createdAt = new Date(apiProduct.createdAt);
  const isNew = Date.now() - createdAt.getTime() < 1000 * 60 * 60 * 24 * 30;
  if (isNew) {
    badges.unshift('NEW');
  }

  return {
    id: apiProduct.id,
    name: apiProduct.title,
    image: apiProduct.cover ? normalizeUrl(apiProduct.cover) : '',
    price,
    oldPrice,
    rating: apiProduct.rating,
    isOutOfStock: apiProduct.stock <= 0,
    badges,
  };
}

function parseGallery(gallery: string): string[] {
  if (!gallery) {
    return [];
  }

  try {
    const parsed = JSON.parse(gallery) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
      .map(normalizeUrl);
  } catch {
    return [];
  }
}

export function mapApiReviewToProductReview(review: ApiReview): ProductReview {
  const author =
    [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') ||
    review.user?.username ||
    'Anonymous';

  return {
    id: review.id,
    author,
    date: new Date(review.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    rating: review.rating,
    title: review.headline,
    content: review.content,
  };
}

export function mapApiProductToDetail(apiProduct: ApiProduct): ProductDetail {
  const base = mapApiProductToCardProduct(apiProduct);
  const galleryImages = parseGallery(apiProduct.gallery);
  const images = base.image
    ? [base.image, ...galleryImages.filter((image) => image !== base.image)]
    : galleryImages;

  return {
    ...base,
    rating: Math.round(base.rating ?? 0),
    description: apiProduct.description,
    images: images.length > 0 ? images : base.image ? [base.image] : [],
    stockCount: apiProduct.stock,
    reviewCount: apiProduct._count?.reviews ?? apiProduct.ratings ?? 0,
    reviews: (apiProduct.reviews ?? []).map(mapApiReviewToProductReview),
  };
}