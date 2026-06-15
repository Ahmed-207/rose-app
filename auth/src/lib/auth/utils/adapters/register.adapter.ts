import { ApiResponse } from '../../models/api-response.model';
import { AuthenticatedSession } from '../../models/authenticated-session.model';
import { RegisterResponseData } from '../../models/register-response.model';
import { adaptAuthenticatedSession } from './auth-session.adapter';

export function adaptRegisterResponse(
  response: ApiResponse<RegisterResponseData>,
): AuthenticatedSession {
  return adaptAuthenticatedSession(response, 'register');
}
