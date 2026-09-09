import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../app/store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import {
  getBookmarksQueryKey,
  isBookmarkSessionCurrent,
} from '../services/bookmarkQueryContract';
import { bookmarksQueryOptions } from '../services/bookmarkQueries';

const normalizeArticleId = (articleId) => String(articleId || '');

/**
 * Hook dùng trong các Article Card để check/toggle bookmark trạng thái.
 *
 * Thiết kế:
 * - BookmarkSessionSync owns the single list request and hydrates this store.
 * - Selector được tối giản: mỗi subscription chỉ re-render khi slice data thay đổi.
 */
export default function useBookmark(articleId) {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.user_id || state.user?.id || null);
  const authReady = Boolean((token || isAuthenticated) && userId);
  const key = normalizeArticleId(articleId);
  const queryClient = useQueryClient();

  // Tách selector nhỏ nhất có thể để tránh re-render không cần thiết
  const isBookmarked = useBookmarkStore((state) => state.bookmarkIds.has(key));
  const hasLoaded = useBookmarkStore((state) => state.hasLoaded);
  const isBookmarkLoading = useBookmarkStore((state) => Boolean(state.loadingByArticleId[key]));
  const toggleBookmarkInStore = useBookmarkStore((state) => state.toggleBookmark);

  const toggleBookmark = useCallback(async () => {
    if (!authReady) return { ok: false, needsAuth: true };

    const result = await toggleBookmarkInStore(key, !isBookmarked, userId);

    if (!result.skipped && !result.stale) {
      const queryKey = getBookmarksQueryKey(userId);
      const sessionIsCurrent = () => (
        isBookmarkSessionCurrent(useAuthStore.getState(), userId)
      );
      const refreshCanonicalList = async () => {
        await queryClient.cancelQueries({ queryKey, exact: true });
        if (!sessionIsCurrent()) return;
        await queryClient.invalidateQueries({
          queryKey,
          exact: true,
          refetchType: 'none',
        });
        if (!sessionIsCurrent()) return;
        const items = await queryClient.fetchQuery(bookmarksQueryOptions(userId));
        const activeAuthState = useAuthStore.getState();
        if (isBookmarkSessionCurrent(activeAuthState, userId)) {
          useBookmarkStore.getState().hydrateFromList(items);
        } else {
          queryClient.removeQueries({ queryKey, exact: true });
        }
      };
      refreshCanonicalList().catch(() => {});
    }

    if (result.stale) return { ok: false, stale: true };
    return { ok: true, isBookmarked: result.isBookmarked };
  }, [authReady, isBookmarked, key, queryClient, toggleBookmarkInStore, userId]);

  return {
    isBookmarked,
    isBookmarkLoading,
    isBookmarkReady: authReady ? hasLoaded : true,
    toggleBookmark,
  };
}
