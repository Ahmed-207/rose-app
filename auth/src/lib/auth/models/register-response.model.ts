import { AuthUser } from './auth-user.model';

export interface RegisterResponseData {
  accessToken?: string;
  token?: string;
  user?: AuthUser;
}

export type RegisterResponse = RegisterResponseData;
export type RegisterResponseUser = AuthUser;
