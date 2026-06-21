export interface ForgotPasswordRequest {
  email: string;
  /** Optional reset page URL. The backend appends the token as a query param. */
  redirectUrl?: string;
}
