import { Metadata } from "libs/shared/products/src/lib/models/products-res"

export interface ProductResponseDto {
  data: Product[]
  metadata: Metadata
}
export interface Product {
  id: string
  title: string
  description: string
  rating: number
  ratings: number
  stock: number
  price: string
  discountType: string
  discountValue: string
  cover: string
  gallery: string
  categoryId: string
  subCategoryId: string
  immutable: boolean
  deletedAt: any
  createdAt: string
  updatedAt: string
  category: Category
  subCategory: SubCategory
  occasions: any[]
  _count: Count
}

export interface Category {
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
