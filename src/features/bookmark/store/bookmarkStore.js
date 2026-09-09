import { create } from 'zustand';
import { createBookmarkApi, deleteBookmarkApi } from '../../article/api/articleApi';
import { isBookmarkMutationCurrent } from '../services/bookmarkQueryContract';

const normalizeArticleId = (articleId) => String(articleId || '');

export const useBookmarkStore = create((set, get) => ({
  bookmarkIds: new Set(),
  isLoading: false,
  error: null,
  hasLoaded: false,
  loadingByArticleId: {},
  sessionUserId: null,
  sessionGeneration: 0,

  setSession: (userId) => {
    const sessionUserId = userId ? String(userId) : null;
    set((state) => {
      if (state.sessionUserId === sessionUserId) return state;
      return {
        bookmarkIds: new Set(),
        isLoading: false,
        error: null,
        hasLoaded: false,
        loadingByArticleId: {},
        sessionUserId,
        sessionGeneration: state.sessionGeneration + 1,
      };
    });
  },

  /**
   * Đồng bộ trạng thái bookmark từ ngoài vào (ví dụ từ TanStack Query trong BookmarksPage)
   * mà không gọi API.
   */
  hydrateFromList: (items = [], userId = null) => {
    if (!Array.isArray(items)) return;
    const bookmarkIds = new Set(
      items.map((item) => normalizeArticleId(item.article_id)).filter(Boolean)
    );
    set((state) => {
      if (userId && String(state.sessionUserId) !== String(userId)) return state;
      const unchanged = state.hasLoaded
        && state.bookmarkIds.size === bookmarkIds.size
        && [...bookmarkIds].every((id) => state.bookmarkIds.has(id));
      if (unchanged) return state;
      return { bookmarkIds, hasLoaded: true, isLoading: false, error: null };
    });
  },

  setArticleBookmarked: (articleId, isBookmarked) => {
    const key = normalizeArticleId(articleId);
    if (!key) return;
    set((state) => {
      const bookmarkIds = new Set(state.bookmarkIds);
      if (isBookmarked) bookmarkIds.add(key);
      else bookmarkIds.delete(key);
      return { bookmarkIds, hasLoaded: true };
    });
  },

  toggleBookmark: async (articleId, nextState, userId) => {
    const key = normalizeArticleId(articleId);
    const sessionUserId = userId ? String(userId) : null;
    const startingState = get();
    const sessionGeneration = startingState.sessionGeneration;
    if (
      !key
      || startingState.loadingByArticleId[key]
      || !isBookmarkMutationCurrent(startingState, sessionUserId, sessionGeneration)
    ) {
      return { skipped: true, isBookmarked: startingState.bookmarkIds.has(key) };
    }

    const previousState = startingState.bookmarkIds.has(key);
    const shouldBookmark = typeof nextState === 'boolean' ? nextState : !previousState;

    // Optimistic update ngay lập tức
    set((state) => ({
      loadingByArticleId: { ...state.loadingByArticleId, [key]: true },
    }));
    get().setArticleBookmarked(key, shouldBookmark);

    try {
      if (shouldBookmark) await createBookmarkApi(key);
      else await deleteBookmarkApi(key);
      set((state) => {
        if (!isBookmarkMutationCurrent(state, sessionUserId, sessionGeneration)) return state;
        const loadingByArticleId = { ...state.loadingByArticleId };
        delete loadingByArticleId[key];
        return { loadingByArticleId, error: null };
      });
      if (!isBookmarkMutationCurrent(get(), sessionUserId, sessionGeneration)) {
        return { stale: true, isBookmarked: shouldBookmark };
      }
      return { isBookmarked: shouldBookmark };
    } catch (error) {
      // Rollback nếu API fail
      if (!isBookmarkMutationCurrent(get(), sessionUserId, sessionGeneration)) {
        return { stale: true, isBookmarked: shouldBookmark };
      }
      get().setArticleBookmarked(key, previousState);
      set((state) => {
        const loadingByArticleId = { ...state.loadingByArticleId };
        delete loadingByArticleId[key];
        return {
          loadingByArticleId,
          error: error.response?.data?.message || error.message || 'Unable to update bookmark',
        };
      });
      throw error;
    }
  },
}));
