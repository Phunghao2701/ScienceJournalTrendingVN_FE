import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../app/store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';

const normalizeArticleId = (articleId) => String(articleId || '');

export default function useBookmark(articleId) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authReady = Boolean(token || user || isAuthenticated);
  const key = normalizeArticleId(articleId);

  const bookmarkIds = useBookmarkStore((state) => state.bookmarkIds);
  const hasLoaded = useBookmarkStore((state) => state.hasLoaded);
  const loadBookmarks = useBookmarkStore((state) => state.loadBookmarks);
  const resetBookmarks = useBookmarkStore((state) => state.resetBookmarks);
  const toggleBookmarkInStore = useBookmarkStore((state) => state.toggleBookmark);
  const loadingByArticleId = useBookmarkStore((state) => state.loadingByArticleId);

  useEffect(() => {
    if (authReady) {
      loadBookmarks().catch(() => {});
      return;
    }
    resetBookmarks();
  }, [authReady, loadBookmarks, resetBookmarks]);

  const isBookmarked = useMemo(() => bookmarkIds.has(key), [bookmarkIds, key]);
  const isBookmarkLoading = Boolean(loadingByArticleId[key]);

  const toggleBookmark = async () => {
    if (!authReady) return { ok: false, needsAuth: true };
    const result = await toggleBookmarkInStore(key, !isBookmarked);
    return { ok: true, isBookmarked: result.isBookmarked };
  };

  return {
    isBookmarked,
    isBookmarkLoading,
    isBookmarkReady: authReady ? hasLoaded : true,
    toggleBookmark,
  };
}
