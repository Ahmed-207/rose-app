// export interface wishlistResponse {
//   status: string
//   count: number
//   data: Daum[]
// }

// export interface Daum {
// inStock: any
//   sold?: number
//   images: string[]
//   subcategory: Subcategory[]
//   ratingsQuantity: number
//   _id: string
//   title: string
//   slug: string
//   description: string
//   quantity: number
//   price: number
//   imageCover: string
//   category: Category
//   brand: Brand
//   ratingsAverage: number
//   createdAt: string
//   updatedAt: string
//   __v: number
//   id: string
//   priceAfterDiscount?: number
// }

// export interface Subcategory {
//   _id: string
//   name: string
//   slug: string
//   category: string
// }

// export interface Category {
//   _id: string
//   name: string
//   slug: string
//   image: string
// }

// export interface Brand {
//   _id: string
//   name: string
//   slug: string
//   image: string
// }




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

