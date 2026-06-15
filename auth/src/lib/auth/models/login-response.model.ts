import { AuthUser } from './auth-user.model';

export interface LoginResponseData {
  accessToken?: string;
  token?: string;
  user?: AuthUser;
}

export type LoginResponse = LoginResponseData;
export type LoginResponseUser = AuthUser;
