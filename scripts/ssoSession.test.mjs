import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const {
  classifySsoError,
  createSessionInitializer,
  getAuthenticatedSessionFromState,
  recoverSsoSession,
} = await import('../src/features/auth/services/ssoSessionContract.js');

assert.equal(classifySsoError({ response: { status: 409, data: { code: 'SSO_BLOCKED' } } }), 'sso-blocked');
assert.equal(classifySsoError({ response: { status: 401, data: { code: 'PARENT_SESSION_MISSING' } } }), 'anonymous');
assert.equal(classifySsoError({ response: { status: 403, data: { code: 'ACCOUNT_BANNED' } } }), 'error');
assert.equal(classifySsoError({ response: { status: 409, data: { code: 'EMAIL_IDENTITY_AMBIGUOUS' } } }), 'error');
assert.equal(classifySsoError({ response: { status: 500 } }), 'throw');

let childChecks = 0;
let bootstraps = 0;
const recovered = await recoverSsoSession({
  checkChildSession: async () => {
    childChecks += 1;
    throw { response: { status: 401 } };
  },
  bootstrapSession: async () => {
    bootstraps += 1;
    return { status: 'authenticated' };
  },
});
assert.deepEqual(recovered, { status: 'authenticated' });
assert.equal(childChecks, 1);
assert.equal(bootstraps, 1);

await assert.rejects(
  recoverSsoSession({
    checkChildSession: async () => { throw { response: { status: 500 } }; },
    bootstrapSession: async () => { throw new Error('must not bootstrap'); },
  }),
  (error) => error?.response?.status === 500,
);

let initializations = 0;
const initializer = createSessionInitializer(async () => {
  initializations += 1;
  return { status: 'authenticated' };
});
const firstInitialization = initializer.run();
const concurrentInitialization = initializer.run();
assert.strictEqual(firstInitialization, concurrentInitialization);
await firstInitialization;
await initializer.run();
assert.equal(initializations, 2, 'only concurrent initialization calls should be deduplicated');
initializer.reset();
await initializer.run();
assert.equal(initializations, 3, 'logout/reset must allow a new session initialization');

const authenticatedUser = { user_id: 'user-a', email: 'a@example.com' };
assert.deepEqual(
  getAuthenticatedSessionFromState({ isAuthenticated: true, user: authenticatedUser }),
  { status: 'authenticated', user: authenticatedUser }
);
assert.equal(
  getAuthenticatedSessionFromState({ isAuthenticated: false, user: authenticatedUser }),
  null
);

const pendingResolvers = [];
const resetRaceInitializer = createSessionInitializer(() => new Promise((resolve) => {
  pendingResolvers.push(resolve);
}));
const staleInitialization = resetRaceInitializer.run();
await Promise.resolve();
resetRaceInitializer.reset();
const currentInitialization = resetRaceInitializer.run();
await Promise.resolve();
pendingResolvers[0]({ status: 'anonymous' });
await staleInitialization;
assert.strictEqual(
  resetRaceInitializer.run(),
  currentInitialization,
  'a stale initialization must not clear a newer in-flight initialization'
);
pendingResolvers[1]({ status: 'authenticated' });
await currentInitialization;

console.log('SSO session tests passed');
