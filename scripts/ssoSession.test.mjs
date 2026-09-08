import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { classifySsoError } = await import('../src/features/auth/services/ssoSessionContract.js');

assert.equal(classifySsoError({ response: { status: 409, data: { code: 'SSO_BLOCKED' } } }), 'sso-blocked');
assert.equal(classifySsoError({ response: { status: 401, data: { code: 'PARENT_SESSION_MISSING' } } }), 'anonymous');
assert.equal(classifySsoError({ response: { status: 403, data: { code: 'ACCOUNT_BANNED' } } }), 'error');
assert.equal(classifySsoError({ response: { status: 409, data: { code: 'EMAIL_IDENTITY_AMBIGUOUS' } } }), 'error');
assert.equal(classifySsoError({ response: { status: 500 } }), 'throw');

console.log('SSO session tests passed');
