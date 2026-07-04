import { Category, Metadata } from "./products-res"

export interface CategoriesRes {
  status: boolean
  code: number
  payload: Payload
}

export interface Payload {
  data: Category[]
  metadata: Metadata
}

