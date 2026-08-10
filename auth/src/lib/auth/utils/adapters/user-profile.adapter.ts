import { ApiResponse } from '../../models/api-response.model';
import { UserProfile } from '../../models/user-profile.model';

type RawUser = {
  id?: string;
  username?: string;
  email?: string;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: string;
  photo?: string | null;
  photoUrl?: string | null;
};

type ProfilePayload = RawUser & {
  user?: RawUser;
};

function normalizeGender(gender?: string): string | undefined {
  if (!gender) {
    return undefined;
  }
  return gender.toUpperCase();
}

function adaptRawUser(raw: RawUser): UserProfile {
  if (!raw.id || !raw.email) {
    throw new Error('Profile response is missing user id or email');
  }

  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    phone: raw.phone ?? null,
    firstName: raw.firstName,
    lastName: raw.lastName,
    gender: normalizeGender(raw.gender),
    photoUrl: raw.photoUrl ?? raw.photo ?? null,
  };
}

export function adaptUserProfileResponse(
  response: ApiResponse<unknown>,
): UserProfile {
  const payload = response.payload as ProfilePayload | undefined;
  if (!payload || typeof payload !== 'object') {
    throw new Error(response.message || 'Profile response is missing payload');
  }

  const raw = payload.user ?? payload;
  return adaptRawUser(raw);
}
