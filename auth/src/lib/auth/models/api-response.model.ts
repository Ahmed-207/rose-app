export interface ApiValidationError {
  path: string;
  message?: string;
  messages?: string[];
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  code: number;
  message: string;
  payload?: T;
  errors?: ApiValidationError[];
}

export function getApiResponsePayload<T>(response: ApiResponse<T>): T | undefined {
  return response.payload;
}
