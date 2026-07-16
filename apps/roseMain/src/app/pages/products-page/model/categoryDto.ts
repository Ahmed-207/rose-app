import { Metadata } from "libs/shared/products/src/lib/models/products-res"

export interface CategoryResponseDto {
  data: Category[]
  metadata: Metadata
}

export interface Category {
  id: string
  title: string
  description: string
  image: string
  immutable: boolean
  createdAt: string
  updatedAt: string
  subCategories: SubCategory[]
  _count: Count
}

export interface SubCategory {
  id: string
  title: string
}

export interface Count {
  products: number
}
