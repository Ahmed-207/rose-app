import { ApiResponse } from '../../models/api-response.model';
import { AuthenticatedSession } from '../../models/authenticated-session.model';
import { RegisterResponseData } from '../../models/register-response.model';

export function adaptRegisterResponse(
  response: ApiResponse<RegisterResponseData>,
): AuthenticatedSession {
  const data = response.data;

  if (!data) {
    throw new Error('Register response is missing data');
  }

  const token = data.accessToken ?? data.token;
  if (!token) {
    throw new Error('Register response is missing token');
  }

  const user = data.user;
  if (!user?.id || !user.username || !user.email) {
    throw new Error('Register response is missing user id, username, or email');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  };
}
