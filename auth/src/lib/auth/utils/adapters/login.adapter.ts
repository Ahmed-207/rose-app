import { ApiResponse } from '../../models/api-response.model';
import { AuthenticatedSession } from '../../models/authenticated-session.model';
import { LoginResponseData } from '../../models/login-response.model';

export function adaptLoginResponse(
  response: ApiResponse<LoginResponseData>,
): AuthenticatedSession {
  const data = response.data;

  if (!data) {
    throw new Error('Login response is missing data');
  }

  const token = data.accessToken ?? data.token;
  if (!token) {
    throw new Error('Login response is missing token');
  }

  const user = data.user;
  if (!user?.id || !user.username || !user.email) {
    throw new Error('Login response is missing user id, username, or email');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  };
}
