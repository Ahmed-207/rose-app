export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
