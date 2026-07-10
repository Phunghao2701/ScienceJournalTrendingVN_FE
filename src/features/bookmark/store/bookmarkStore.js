import { create } from 'zustand';
import { createBookmarkApi, deleteBookmarkApi, getBookmarksApi } from '../../article/api/articleApi';

const normalizeArticleId = (articleId) => String(articleId || '');

export const useBookmarkStore = create((set, get) => ({
  bookmarkIds: new Set(),
  isLoading: false,
  error: null,
  hasLoaded: false,
  loadingByArticleId: {},

  resetBookmarks: () => set({
    bookmarkIds: new Set(),
    isLoading: false,
    error: null,
    hasLoaded: false,
    loadingByArticleId: {},
  }),

  loadBookmarks: async ({ force = false } = {}) => {
    const state = get();
    if (state.isLoading || (state.hasLoaded && !force)) return state.bookmarkIds;

    set({ isLoading: true, error: null });
    try {
      const response = await getBookmarksApi();
      const items = response.data?.data || [];
      const bookmarkIds = new Set(
        items
          .map((item) => normalizeArticleId(item.article_id))
          .filter(Boolean)
      );
      set({ bookmarkIds, isLoading: false, hasLoaded: true, error: null });
      return bookmarkIds;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Unable to load bookmarks',
      });
      throw error;
    }
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

  toggleBookmark: async (articleId, nextState) => {
    const key = normalizeArticleId(articleId);
    if (!key || get().loadingByArticleId[key]) return { skipped: true };

    const previousState = get().bookmarkIds.has(key);
    const shouldBookmark = typeof nextState === 'boolean' ? nextState : !previousState;

    set((state) => ({
      loadingByArticleId: { ...state.loadingByArticleId, [key]: true },
    }));
    get().setArticleBookmarked(key, shouldBookmark);

    try {
      if (shouldBookmark) await createBookmarkApi(key);
      else await deleteBookmarkApi(key);
      set((state) => {
        const loadingByArticleId = { ...state.loadingByArticleId };
        delete loadingByArticleId[key];
        return { loadingByArticleId, error: null };
      });
      return { isBookmarked: shouldBookmark };
    } catch (error) {
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
