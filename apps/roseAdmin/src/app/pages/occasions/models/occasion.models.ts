export interface Occasion {
  id: string;
  title: string;
  description: string;
  image: string;
  immutable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OccasionListResponse {
  status: boolean;
  code: number;
  payload: {
    data: Occasion[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface OccasionPayload {
  title: string;
  description: string;
  image?: string;
}

export interface OccasionUpdateResponse {
  status: boolean;
  code: number;
  payload: {
    occasion: Occasion;
  };
}

export interface OccasionDeleteResponse {
  status: boolean;
  code: number;
  message: string;
}