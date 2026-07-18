import { Product } from "./product.model"

export interface Root {
  status: boolean
  code: number
  payload: WishListPayload
}

export interface WishListPayload {
  wishlistItems: WishlistItem[]
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
  product: Product
}
