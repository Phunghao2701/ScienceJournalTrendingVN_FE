import assert from 'node:assert/strict';
import { shouldSkipTokenRefresh } from '../src/shared/utils/authRefresh.js';

assert.equal(shouldSkipTokenRefresh('/auth/login'), true, 'login endpoint should skip refresh');
assert.equal(shouldSkipTokenRefresh('http://localhost:8000/api/v1/auth/login'), true, 'login endpoint (full URL) should skip refresh');
assert.equal(shouldSkipTokenRefresh('/auth/register'), true, 'register endpoint should skip refresh');
assert.equal(shouldSkipTokenRefresh('/auth/google'), true, 'google login endpoint should skip refresh');
assert.equal(shouldSkipTokenRefresh('/auth/refresh'), true, 'refresh endpoint itself should skip refresh (avoid recursive loop)');
assert.equal(shouldSkipTokenRefresh('/projects'), false, 'regular protected endpoint should still attempt refresh');
assert.equal(shouldSkipTokenRefresh('/articles/analysis'), false, 'unrelated endpoint should still attempt refresh');
assert.equal(shouldSkipTokenRefresh(''), false, 'empty url should not skip refresh');
assert.equal(shouldSkipTokenRefresh(undefined), false, 'missing url should not skip refresh');

console.log('authRefresh.test.mjs: all assertions passed');
