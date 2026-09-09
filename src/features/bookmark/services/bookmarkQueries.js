import { getBookmarksApi } from '../../article/api/articleApi';
import { createBookmarksQueryOptions } from './bookmarkQueryContract';

export const fetchBookmarks = async ({ signal } = {}) => {
  const response = await getBookmarksApi({ signal });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Unable to load bookmarks');
  }
  return response.data.data || [];
};

export const bookmarksQueryOptions = (userId) => createBookmarksQueryOptions(fetchBookmarks, userId);
