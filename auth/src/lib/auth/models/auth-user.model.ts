export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  role?: string;
}
