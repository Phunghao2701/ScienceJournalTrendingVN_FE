import assert from 'node:assert/strict';
import { resolveLoginUser } from '../src/features/auth/services/authIdentity.js';

const passwordUser = resolveLoginUser({
  responseBody: { success: true, data: { token: 'opaque-for-test' } },
  tokenPayload: {
    user_id: 'password-user',
    email: 'password@example.com',
    role: 'STUDENT',
  },
});
assert.deepEqual(passwordUser, {
  user_id: 'password-user',
  email: 'password@example.com',
  role: 'STUDENT',
});

const googleUser = resolveLoginUser({
  responseBody: {
    data: {
      user: {
        user_id: 'google-user',
        email: 'canonical@example.com',
        role: 'ADMIN',
      },
    },
  },
  tokenPayload: {
    user_id: 'stale-token-user',
    email: 'stale@example.com',
    role: 'STUDENT',
  },
});
assert.deepEqual(googleUser, {
  user_id: 'google-user',
  email: 'canonical@example.com',
  role: 'ADMIN',
});

assert.equal(
  resolveLoginUser({ responseBody: { success: true }, tokenPayload: {} }),
  null,
  'login must not create an authenticated session without a stable user ID'
);

console.log('Auth identity tests passed');
