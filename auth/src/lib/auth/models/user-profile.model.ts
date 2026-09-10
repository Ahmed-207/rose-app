import { Gender } from '../config/gender.enum';

export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  gender?: Gender | string;
  photoUrl?: string | null;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  /** Temporary upload URL returned by POST /api/upload. */
  photo?: string | null;
}

export interface RequestEmailChangeRequest {
  newEmail: string;
}

export interface ConfirmEmailChangeRequest {
  code: string;
}
