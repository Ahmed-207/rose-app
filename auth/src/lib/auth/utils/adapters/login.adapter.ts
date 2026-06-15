import { ApiResponse } from '../../models/api-response.model';
import { AuthenticatedSession } from '../../models/authenticated-session.model';
import { LoginResponseData } from '../../models/login-response.model';
import { adaptAuthenticatedSession } from './auth-session.adapter';

export function adaptLoginResponse(
  response: ApiResponse<LoginResponseData>,
): AuthenticatedSession {
  return adaptAuthenticatedSession(response, 'login');
}
