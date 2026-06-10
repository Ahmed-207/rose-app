import { API_URL } from './api';

export const AUTH_API_BASE = `${API_URL}/api/auth`;

export enum AuthApiEndpoint {
  SendEmailVerification = 'send-email-verification',
  ConfirmEmailVerification = 'confirm-email-verification',
  Register = 'register',
  Login = 'login',
  ForgotPassword = 'forgot-password',
  ResetPassword = 'reset-password',
}

export enum AuthHttpMethod {
  Post = 'POST',
}
