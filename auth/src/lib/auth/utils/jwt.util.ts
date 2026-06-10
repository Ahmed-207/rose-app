import { Role } from '../config/role.enum';

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function resolveRoleFromToken(token: string): Role | null {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const rawRole =
    payload['role'] ??
    (Array.isArray(payload['roles']) ? payload['roles'][0] : null);

  if (rawRole === Role.Admin || rawRole === 'admin') {
    return Role.Admin;
  }

  if (rawRole === Role.User || rawRole === 'user' || rawRole === 'client') {
    return Role.User;
  }

  return null;
}
