export enum AuthApiEndpoint {
  SendEmailVerification = 'send-email-verification',
  ConfirmEmailVerification = 'confirm-email-verification',
  Register = 'register',
  Login = 'login',
  ForgotPassword = 'forgot-password',
  ResetPassword = 'reset-password',
}

export enum UsersApiEndpoint {
  Profile = 'profile',
  ChangePassword = 'change-password',
  EmailRequest = 'email/request',
  EmailConfirm = 'email/confirm',
  Account = 'account',
}

export enum AuthHttpMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}
