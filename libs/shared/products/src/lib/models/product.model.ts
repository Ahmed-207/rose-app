import { Metadata } from './metadata.model';

export interface ProductCategoryRef {
    id: string;
    title: string;
}

export interface ProductSubCategoryRef {
    id: string;
    title: string;
}

export interface ProductCount {
    reviews: number;
    cartItems: number;
    wishlistItems: number;
}

export interface Review {
    id: string;
    rating: number;
    headline: string;
    content: string;
    createdAt: string;
    user?: {
        firstName?: string;
        lastName?: string;
        username?: string;
    };
}

export interface Product {
    id: string;
    title: string;
    description: string;
    rating: number;
    ratings: number;
    stock: number;
    price: string;
    discountType: string;
    discountValue: string;
    cover: string;
    gallery: string;
    categoryId: string;
    subCategoryId: string;
    immutable: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    category: ProductCategoryRef;
    subCategory: ProductSubCategoryRef;
    occasions: unknown[];
    _count: ProductCount;
    reviews?: Review[];
}

// APICallerService.get<T>/.post<T> already unwrap the server's outer
// `{ payload: T }` envelope — these interfaces describe what's INSIDE
// that payload, not the raw HTTP response. Don't re-add `payload` here.
export interface ProductsRes {
    data: Product[];
    metadata: Metadata;
}

export interface SingleProductRes {
    product: Product;
}

export interface ReviewsRes {
    data: Review[];
    metadata: Metadata;
}

export interface CreateReviewReq {
    productId: string;
    rating: number;
    headline: string;
    content: string;
}

export interface CreateReviewRes {
    review: Review;
}