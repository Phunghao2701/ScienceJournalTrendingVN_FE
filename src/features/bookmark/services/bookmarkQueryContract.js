export const BOOKMARKS_QUERY_ROOT = Object.freeze(['bookmarks', 'list']);
export const BOOKMARKS_STALE_TIME_MS = 2 * 60 * 1000;
export const BOOKMARKS_GC_TIME_MS = 5 * 60 * 1000;

export const getBookmarksQueryKey = (userId) => [
  ...BOOKMARKS_QUERY_ROOT,
  String(userId),
];

export const getBookmarkUserId = (authState) => (
  authState?.user?.user_id || authState?.user?.id || null
);

export const isBookmarkSessionCurrent = (authState, userId) => (
  Boolean(authState?.isAuthenticated)
  && Boolean(userId)
  && String(getBookmarkUserId(authState)) === String(userId)
);

export const isBookmarkMutationCurrent = (bookmarkState, userId, generation) => (
  Boolean(userId)
  && String(bookmarkState?.sessionUserId) === String(userId)
  && bookmarkState?.sessionGeneration === generation
);

export const createBookmarksQueryOptions = (queryFn, userId) => ({
  queryKey: getBookmarksQueryKey(userId),
  queryFn,
  staleTime: BOOKMARKS_STALE_TIME_MS,
  gcTime: BOOKMARKS_GC_TIME_MS,
});

export const removeBookmarkFromList = (items = [], articleId) => (
  items.filter((item) => String(item.article_id) !== String(articleId))
);
