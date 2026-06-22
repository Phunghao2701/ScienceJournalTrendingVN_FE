/**
 * Normalize a single journal item from backend response to the shape expected by FE components.
 * @param {Object} raw - Raw journal object from backend.
 * @returns {Object} Normalized journal object.
 */
export function normalizeJournalItem(raw = {}) {
  const journalId = String(raw.journal_id || raw.id || '');

  return {
    id: journalId,
    journal_id: journalId,
    display_name: raw.display_name || 'Chưa rõ tên',
    issn: raw.issn || '',
    type: raw.type || '',
    coverage: raw.coverage || '',
    is_open_access: raw.is_open_access ?? false,
    is_oa_diamond: raw.is_oa_diamond ?? false,

    // Publisher / Zone
    publisher: raw.publisher_name || raw.publisher || '',
    country: raw.country_name || raw.country || '',

    // Ranking metrics
    metric_value: raw.metric_value != null ? Number(raw.metric_value) : null,
    metric_name: raw.metric_name || 'SJR',
    metric_year: raw.metric_year || null,
    quartile: raw.quartile || raw.best_quartile || '',

    // Subject info (optional, may come from enriched endpoints)
    subject_area_name: raw.subject_area_name || '',
    subject_category_name: raw.subject_category_name || '',
  };
}

/**
 * Normalize the full search response from backend.
 * @param {Object} response - Axios response.data
 * @returns {{ items: Array, pagination: { page: number, limit: number, total: number } }}
 */
export function normalizeSearchResponse(responseData = {}) {
  const data = responseData.data || responseData;

  const rawItems = data.items || [];
  const items = rawItems.map(normalizeJournalItem);

  const pagination = data.pagination || {};
  const total = pagination.total ?? data.total ?? items.length;
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;

  return {
    items,
    pagination: { page, limit, total },
  };
}
