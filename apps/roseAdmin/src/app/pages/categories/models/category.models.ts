export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  immutable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: CategorySubCategory[];
  _count?: CategoryCount;
}

export interface CategorySubCategory {
  id: string;
  title: string;
}

export interface CategoryCount {
  products: number;
}

export interface CategoryListResponse {
  data: Category[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryPayload {
  title: string;
  description: string;
  image?: string;
}

export interface CategoryUpdateResponse {
  category: Category;
}

export interface CategoryDeleteResponse {
  status: boolean;
  code: number;
  message: string;
}
