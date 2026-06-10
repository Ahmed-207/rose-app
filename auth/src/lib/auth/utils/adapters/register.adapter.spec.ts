import { describe, expect, it } from 'vitest';
import { adaptRegisterResponse } from './register.adapter';

describe('adaptRegisterResponse', () => {
  it('maps token and user fields into an authenticated session', () => {
    const session = adaptRegisterResponse({
      status: true,
      code: 201,
      message: 'Registration successful',
      data: {
        token: 'register-token',
        user: {
          id: 'user-10',
          username: 'newuser',
          email: 'newuser@example.com',
        },
      },
    });

    expect(session).toEqual({
      id: 'user-10',
      username: 'newuser',
      email: 'newuser@example.com',
      token: 'register-token',
    });
  });
});
