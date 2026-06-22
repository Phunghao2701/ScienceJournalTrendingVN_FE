/**
 * Chuẩn hóa pagination từ nhiều dạng response khác nhau của backend.
 *
 * @param {Object} pagination - Pagination raw từ API.
 * @param {number} fallbackLimit - Limit fallback nếu API không trả.
 * @returns {Object} Pagination đã chuẩn hóa.
 */
export function normalizePagination(pagination, fallbackLimit = 20) {
  const page = Number(pagination?.page || 1);
  const limit = Number(pagination?.limit || fallbackLimit);
  const total = Number(pagination?.total || 0);
  const totalPages = Number(pagination?.total_pages || pagination?.totalPages || Math.max(1, Math.ceil(total / limit)) || 1);

  return { page, limit, total, total_pages: totalPages };
}

/**
 * Lấy mảng items từ các response shape phổ biến.
 *
 * @param {*} payload - Payload data từ API.
 * @returns {Array} Danh sách item đã tách ra.
 */
function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.keywords)) return payload.keywords;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.articles)) return payload.articles;
  return [];
}

/**
 * Chuẩn hóa keyword item để UI dùng field nhất quán.
 *
 * @param {Object} item - Keyword item từ API.
 * @returns {Object} Keyword item đã chuẩn hóa.
 */
export function normalizeKeyword(item) {
  const id = item.keyword_id || item.id || item.keywordId;
  const name = item.display_name || item.keyword || item.name || item.term || 'Unnamed keyword';
  const articleCount = item.article_count ?? item.count ?? item.total_articles ?? item.totalArticles ?? 0;

  return {
    ...item,
    keyword_id: id,
    id,
    display_name: name,
    article_count: Number(articleCount || 0),
  };
}

/**
 * Chuẩn hóa response danh sách keywords.
 *
 * @param {Object} response - Axios response.
 * @param {number} fallbackLimit - Limit fallback.
 * @returns {{items: Array, pagination: Object}}
 */
export function normalizeKeywordListResponse(response, fallbackLimit = 20) {
  const payload = response?.data?.data ?? response?.data ?? response;
  const items = extractItems(payload).map(normalizeKeyword);

  return {
    items,
    pagination: normalizePagination(payload?.pagination, fallbackLimit),
  };
}

/**
 * Chuẩn hóa response chi tiết keyword.
 *
 * @param {Object} response - Axios response.
 * @returns {Object|null} Keyword detail đã chuẩn hóa.
 */
export function normalizeKeywordDetailResponse(response) {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (!payload || Array.isArray(payload)) return null;
  return normalizeKeyword(payload);
}

/**
 * Chuẩn hóa article item để UI có thể dùng article_id nhất quán.
 *
 * @param {Object} item - Article item từ API.
 * @returns {Object} Article item đã chuẩn hóa.
 */
export function normalizeKeywordArticle(item) {
  const articleId = item.article_id || item.id || item.articleId;
  const journal = item.journal || {};

  return {
    ...item,
    article_id: articleId,
    id: articleId,
    journal_name: item.journal_name || journal.display_name || journal.name,
    citations_count: item.citations_count ?? item.citation_count ?? item.citations ?? 0,
  };
}

/**
 * Chuẩn hóa response bài báo liên quan keyword.
 *
 * @param {Object} response - Axios response.
 * @param {number} fallbackLimit - Limit fallback.
 * @returns {{items: Array, pagination: Object}}
 */
export function normalizeKeywordArticlesResponse(response, fallbackLimit = 10) {
  const payload = response?.data?.data ?? response?.data ?? response;
  const items = extractItems(payload).map(normalizeKeywordArticle);

  return {
    items,
    pagination: normalizePagination(payload?.pagination, fallbackLimit),
  };
}
