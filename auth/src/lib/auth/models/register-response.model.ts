export interface RegisterResponseUser {
  id?: string;
  username?: string;
  email?: string;
}

export interface RegisterResponseData {
  accessToken?: string;
  token?: string;
  user?: RegisterResponseUser;
}

export type RegisterResponse = RegisterResponseData;
