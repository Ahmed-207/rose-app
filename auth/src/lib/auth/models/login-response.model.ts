export interface LoginResponseUser {
  id?: string;
  username?: string;
  email?: string;
}

export interface LoginResponseData {
  accessToken?: string;
  token?: string;
  user?: LoginResponseUser;
}

export type LoginResponse = LoginResponseData;
