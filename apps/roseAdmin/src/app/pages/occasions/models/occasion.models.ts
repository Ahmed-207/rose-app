export interface Occasion {
  id: string;
  title: string;
  description: string;
  image: string;
  immutable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: OccasionSubCategory[];
  _count?: OccasionCount;
}

export interface OccasionSubCategory {
  id: string;
  title: string;
}

export interface OccasionCount {
  products: number;
}

export interface OccasionListResponse {
  data: Occasion[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OccasionPayload {
  title: string;
  description: string;
  image?: string;
}

export interface OccasionUpdateResponse {
  occasion: Occasion;
}

export interface OccasionDeleteResponse {
  status: boolean;
  code: number;
  message: string;
}

export interface UploadImageRes {
  url: string;
}