import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';

const {
  createBookmarksQueryOptions,
  getBookmarksQueryKey,
  isBookmarkMutationCurrent,
  isBookmarkSessionCurrent,
  removeBookmarkFromList,
} = await import('../src/features/bookmark/services/bookmarkQueryContract.js');

let requests = 0;
let resolveRequest;
const request = new Promise((resolve) => {
  resolveRequest = resolve;
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const options = createBookmarksQueryOptions(async () => {
  requests += 1;
  await request;
  return [{ article_id: 42, title: 'Cached article' }];
}, 'user-a');

const prefetch = queryClient.ensureQueryData(options);
const pageLoad = queryClient.ensureQueryData(options);
resolveRequest();

const [prefetchedItems, pageItems] = await Promise.all([prefetch, pageLoad]);
assert.equal(requests, 1, 'prefetch and page load must share one HTTP request');
assert.deepEqual(prefetchedItems, pageItems);
assert.deepEqual(options.queryKey, ['bookmarks', 'list', 'user-a']);
assert.notDeepEqual(
  getBookmarksQueryKey('user-a'),
  getBookmarksQueryKey('user-b'),
  'bookmark caches must be isolated by user ID'
);
assert.equal(
  isBookmarkSessionCurrent({ isAuthenticated: true, user: { user_id: 'user-a' } }, 'user-a'),
  true
);
assert.equal(
  isBookmarkSessionCurrent({ isAuthenticated: true, user: { user_id: 'user-b' } }, 'user-a'),
  false,
  'a late response must not hydrate a different user session'
);
assert.equal(
  isBookmarkSessionCurrent({ isAuthenticated: false, user: { user_id: 'user-a' } }, 'user-a'),
  false,
  'a late response must not hydrate after logout'
);

const userAMutation = { userId: 'user-a', generation: 4 };
assert.equal(
  isBookmarkMutationCurrent(
    { sessionUserId: 'user-b', sessionGeneration: 5 },
    userAMutation.userId,
    userAMutation.generation
  ),
  false,
  'a late mutation from user A must not complete or roll back into user B state'
);
assert.equal(
  isBookmarkMutationCurrent(
    { sessionUserId: 'user-a', sessionGeneration: 5 },
    userAMutation.userId,
    userAMutation.generation
  ),
  false,
  'logout/login of the same user must invalidate mutations from the previous session generation'
);

await queryClient.ensureQueryData(options);
assert.equal(requests, 1, 'fresh bookmark data must be reused from the query cache');

const original = [
  { article_id: 42, title: 'Keep original immutable' },
  { article_id: 7, title: 'Keep' },
];
const filtered = removeBookmarkFromList(original, '42');
assert.deepEqual(filtered, [{ article_id: 7, title: 'Keep' }]);
assert.equal(original.length, 2, 'removing a bookmark must not mutate cached input');

queryClient.clear();
console.log('Bookmark session tests passed');
