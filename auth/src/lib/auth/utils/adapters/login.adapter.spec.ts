import { describe, expect, it } from 'vitest';
import { adaptLoginResponse } from './login.adapter';

describe('adaptLoginResponse', () => {
  it('maps accessToken and user fields into an authenticated session', () => {
    const session = adaptLoginResponse({
      status: true,
      code: 200,
      message: 'Login successful',
      data: {
        accessToken: 'jwt-access-token',
        user: {
          id: 'user-1',
          username: 'ahmed',
          email: 'ahmed@example.com',
        },
      },
    });

    expect(session).toEqual({
      id: 'user-1',
      username: 'ahmed',
      email: 'ahmed@example.com',
      token: 'jwt-access-token',
    });
  });
});
