import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

function isApiResponse(value: unknown): value is ApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as ApiResponse).message === 'string'
  );
}

export function resolveAuthErrorMessage(
  error: unknown,
  fallback = DEFAULT_MESSAGE,
): string {
  if (error instanceof HttpErrorResponse) {
    if (isApiResponse(error.error)) {
      return error.error.message || fallback;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
