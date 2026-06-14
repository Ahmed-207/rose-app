export interface ApiValidationError {
  path: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: ApiValidationError[];
}
