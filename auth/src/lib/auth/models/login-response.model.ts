export interface LoginResponseUser {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  role?: string;
}

export interface LoginResponseData {
  accessToken?: string;
  token?: string;
  user?: LoginResponseUser;
}

export type LoginResponse = LoginResponseData;