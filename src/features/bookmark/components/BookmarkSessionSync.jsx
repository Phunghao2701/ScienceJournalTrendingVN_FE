import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../app/store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import {
  BOOKMARKS_QUERY_ROOT,
  getBookmarkUserId,
  getBookmarksQueryKey,
  isBookmarkSessionCurrent,
} from '../services/bookmarkQueryContract';
import { bookmarksQueryOptions } from '../services/bookmarkQueries';

/**
 * Owns the authenticated bookmark prefetch for every route, including `/`.
 * TanStack Query is the only network cache; Zustand only mirrors bookmark IDs.
 */
export default function BookmarkSessionSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore(getBookmarkUserId);
  const hydrateFromList = useBookmarkStore((state) => state.hydrateFromList);
  const setBookmarkSession = useBookmarkStore((state) => state.setSession);
  const queryClient = useQueryClient();
  const previousUserId = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const normalizedUserId = userId ? String(userId) : null;
    const priorUserId = previousUserId.current;

    if (priorUserId && priorUserId !== normalizedUserId) {
      const priorQueryKey = getBookmarksQueryKey(priorUserId);
      queryClient.cancelQueries({ queryKey: priorQueryKey, exact: true });
      queryClient.removeQueries({ queryKey: priorQueryKey, exact: true });
    }
    previousUserId.current = normalizedUserId;
    setBookmarkSession(isAuthenticated ? normalizedUserId : null);

    if (!isAuthenticated || !normalizedUserId) {
      queryClient.cancelQueries({ queryKey: BOOKMARKS_QUERY_ROOT });
      queryClient.removeQueries({ queryKey: BOOKMARKS_QUERY_ROOT });
      return () => {
        cancelled = true;
      };
    }

    queryClient
      .ensureQueryData(bookmarksQueryOptions(normalizedUserId))
      .then((items) => {
        const authState = useAuthStore.getState();
        if (!cancelled && isBookmarkSessionCurrent(authState, normalizedUserId)) {
          hydrateFromList(items, normalizedUserId);
        }
      })
      .catch(() => {
        // Prefetch is non-blocking; BookmarksPage owns the visible error state.
      });

    return () => {
      cancelled = true;
    };
  }, [hydrateFromList, isAuthenticated, queryClient, setBookmarkSession, userId]);

  return null;
}
