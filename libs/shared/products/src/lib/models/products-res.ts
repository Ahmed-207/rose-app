export interface ProductsRes {
  status: boolean
  code: number
  payload: Payload
}

export interface OneProductRes {
  status: boolean
  code: number
  payload: OneProductPayload
}

export interface Payload {
  data: Product[] 
  metadata: Metadata
}

export interface OneProductPayload {
  data: Product
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
  immutable: boolean;
  createdAt: string;
  updatedAt: string;
  occasions: any[];
  _count: Count;
  subCategoryId?: string | any;
  subCategory?: SubCategory | any;
  category: Category;
  reviews?: Review[];
}


export interface Category {
  [x: string]: any
  id: string
  title: string
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
  description: string
  image: string
  immutable: boolean
  createdAt: string
  updatedAt: string
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

export interface Count {
  reviews: number
  cartItems: number
  wishlistItems: number
}
