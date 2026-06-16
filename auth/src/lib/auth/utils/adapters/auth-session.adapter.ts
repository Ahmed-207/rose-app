import { ApiResponse } from '../../models/api-response.model';
import { AuthenticatedSession } from '../../models/authenticated-session.model';
import { LoginResponseData } from '../../models/login-response.model';

export function adaptAuthenticatedSession(
  response: ApiResponse<LoginResponseData>,
  action: 'login' | 'register',
): AuthenticatedSession {
  const data = response.payload;

  if (!data) {
    throw new Error(`${action} response is missing payload`);
  }

  const token = data.accessToken ?? data.token;
  if (!token) {
    throw new Error(`${action} response is missing token`);
  }

  const user = data.user;
  if (!user?.id || !user.username || !user.email) {
    throw new Error(`${action} response is missing user id, username, or email`);
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  };
}
