import { Metadata } from "libs/shared/products/src/lib/models/products-res"

export interface OccasionResponseDto {
  data: Occasion[]
  metadata: Metadata
}

export interface Occasion {
  id: string
  title: string
  description: string
  image: string
  immutable: boolean
  createdAt: string
  updatedAt: string
}


