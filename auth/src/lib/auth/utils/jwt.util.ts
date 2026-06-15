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
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readRoleClaim(payload: Record<string, unknown>): string | null {
  const directRole = payload['role'];
  if (typeof directRole === 'string') {
    return directRole;
  }

  const roles = payload['roles'];
  if (Array.isArray(roles) && typeof roles[0] === 'string') {
    return roles[0];
  }

  const user = payload['user'];
  if (user && typeof user === 'object' && !Array.isArray(user)) {
    const userRole = (user as Record<string, unknown>)['role'];
    if (typeof userRole === 'string') {
      return userRole;
    }
  }

  return null;
}

export function resolveRoleFromToken(token: string): Role | null {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const rawRole = readRoleClaim(payload);

  if (!rawRole) {
    return null;
  }

  const normalizedRole = rawRole.toLowerCase();

  if (normalizedRole === Role.Admin) {
    return Role.Admin;
  }

  if (normalizedRole === Role.User || normalizedRole === 'client') {
    return Role.User;
  }

  return null;
}
