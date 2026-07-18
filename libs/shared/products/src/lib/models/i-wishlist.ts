




export interface Root {
  status: boolean
  code: number
  payload: Payload
}

export interface Payload {
  wishlistItems: WishlistItem[]
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
  product: Product
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
  subCategoryId?: string
  immutable: boolean
  deletedAt: any
  createdAt: string
  updatedAt: string
  category: Category
  subCategory?: SubCategory
}

export interface Category {
  id: string
  title: string
}

export interface SubCategory {
  id: string
  title: string
}

