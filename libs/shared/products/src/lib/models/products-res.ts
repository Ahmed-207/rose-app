export interface ProductsRes {
  status: boolean
  code: number
  payload: Payload
}

export interface ReviewsRes {
  status: boolean
  code: number
  payload: ReviewsPayload
}

export interface CreateReviewReq {
  productId: string
  headline: string
  content: string
  rating: number
}

export interface CreateReviewRes {
  status: boolean
  code: number
  message?: string
  payload?: {
    review?: Review
    data?: Review
  }
}


export interface SingleProductRes {
  status: boolean
  code: number
  payload: {
    product: Product
  }
}

export interface Payload {
  data: Product[]
  metadata: Metadata
}

export interface ReviewsPayload {
  data: Review[]
  metadata: Metadata
}


export interface Product {
  id: string;
  _id?:string;
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
  immutable: boolean;
  createdAt: string;
  updatedAt: string;
  occasions: unknown[];
  _count: Count;
  subCategoryId?: string | null;
  subCategory?: SubCategory | null;
  category: Category;
  reviews?: Review[];
}


export interface SubCategory {
  id: string
  title: string
}

export interface Count {
  reviews: number
  cartItems: number
  wishlistItems: number
}

export interface Metadata {
  page: number
  limit: number
  total: number
  totalPages: number
}


export interface Category {
  id: string
  title: string
  description?: string
  image?: string
  immutable?: boolean
  createdAt?: string
  updatedAt?: string
  subCategories?: SubCategory[]
  _count?: CategoryCount
}

export interface CategoryCount {
  products: number
}

export interface Review {
  id: string
  userId: string
  productId: string
  headline: string
  content: string
  rating: number
  createdAt: string
  updatedAt: string
  user: User
}

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
}

