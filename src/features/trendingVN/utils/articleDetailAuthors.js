export const ARTICLE_DETAIL_AUTHOR_PREVIEW_LIMIT = 5;

const normalizeAuthors = (authors) => (Array.isArray(authors) ? authors : []);

export const getVisibleArticleDetailAuthors = (
  authors,
  isExpanded,
  limit = ARTICLE_DETAIL_AUTHOR_PREVIEW_LIMIT,
) => {
  const normalizedAuthors = normalizeAuthors(authors);
  return isExpanded ? normalizedAuthors : normalizedAuthors.slice(0, limit);
};

export const getHiddenArticleDetailAuthorCount = (
  authors,
  limit = ARTICLE_DETAIL_AUTHOR_PREVIEW_LIMIT,
) => Math.max(normalizeAuthors(authors).length - limit, 0);
