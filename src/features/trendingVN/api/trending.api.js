/**
 * Raw API call layer for the TrendingVN (Research Trend Tracking) feature.
 *
 * File: src/features/trendingVN/api/trending.api.js
 *
 * NOTE: Uses `httpClient` (shared/services/httpClient.js), NOT `api.js`.
 * This means:
 *   - Token is read from localStorage.getItem('accessToken') (not Zustand)
 *   - There is NO 401 refresh-retry loop
 * Backend data is sourced from academic platforms (Semantic Scholar, OpenAlex, Crossref).
 * Base URL is /api/v1 as configured in httpClient.
 *
 * Consumed by: useTrending.js (most endpoints).
 * Note: useTrendingFilters.js does NOT use this file -- it uses journal/api and topic/api instead.
 */
import httpClient from '../../../shared/services/httpClient';

/**
 * Fetch a paginated list of research articles with optional search and sorting.
 *
 * Auth note: without `keywords` param -> public endpoint (no token needed).
 *            with `keywords` param -> advanced search mode (Bearer Token required).
 *
 * @param {Object} params
 * @param {string}  [params.search]     - Filter by article title
 * @param {string}  [params.keywords]   - Comma-separated keyword list for advanced search
 * @param {number}  [params.page=1]     - Page number
 * @param {number}  [params.limit=10]   - Items per page
 * @param {string}  [params.sortBy]     - Sort field: article_id | title | publication_year | created_at | doi
 * @param {string}  [params.sortOrder]  - Sort direction: asc | desc
 */
export const getArticlesApi = (params = {}) =>
  httpClient.get('/articles', { params });

/**
 * Fetch research topics for display and filter dropdown population.
 *
 * @param {Object} params
 * @param {number}  [params.page=1]                - Page number
 * @param {number}  [params.limit=10]              - Items per page
 * @param {string}  [params.search]                - Filter by display name
 * @param {number}  [params.subject_area_id]       - Filter by parent Subject Area ID
 * @param {number}  [params.subject_category_id]   - Filter by Subject Category ID
 * @param {string}  [params.sort_by]               - Sort field: topic_id | display_name | score
 * @param {string}  [params.sort_order]            - Sort direction: asc | desc
 */
export const getTopicsApi = (params = {}) =>
  httpClient.get('/topics', { params });

/**
 * Fetch scientific journals for top-journals display and filter dropdowns.
 * Requires authentication (Bearer Token).
 *
 * @param {Object} params
 * @param {string}  [params.search]    - Filter by journal name
 * @param {number}  [params.page=1]    - Page number
 * @param {number}  [params.limit=10]  - Items per page
 */
export const getJournalsApi = (params = {}) =>
  httpClient.get('/journal', { params });

/**
 * Fetch the author influence leaderboard.
 * Ranked by cited_by_count, h_index, and works_count. Requires authentication.
 *
 * @param {Object} params
 * @param {number}  [params.page=1]    - Page number
 * @param {number}  [params.limit=10]  - Max authors per page
 */
export const getAuthorsLeaderboardApi = (params = {}) =>
  httpClient.get('/author/leaderboard', { params });

/**
 * Fetch top-level subject areas.
 * Used to populate the "Field" filter dropdown on the trending page.
 */
export const getSubjectAreasApi = () =>
  httpClient.get('/catalog/subject-areas');

/**
 * Fetch subject categories (sub-disciplines under a subject area).
 * Used to populate the "Discipline" filter dropdown on the trending page.
 *
 * @param {Object} params
 * @param {number}  [params.subject_area_id]  - Filter to children of this area
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=100]
 */
export const getSubjectCategoriesApi = (params = {}) =>
  httpClient.get('/catalog/subject-categories', { params });

/**
 * Top journals ranked by total citations within the last N years.
 * Endpoint: GET /api/v1/trending-vn/top-journals
 * Response: { data: { window: { from_year, to_year, years }, items: [...] } }
 * Item fields: journal_id, journal_name, total_recent_citations,
 *              recent_articles_count, top_keywords, top_topics
 *
 * @param {Object} params
 * @param {number} [params.years=2]  - Lookback window in years (1-10)
 * @param {number} [params.limit=7]  - Number of journals to return (1-50)
 */
export const getTopJournalsTrendingApi = (params = {}) =>
  httpClient.get('/trending-vn/top-journals', { params });

/**
 * Top universities by trending keyword/topic activity and first-authorship.
 * Endpoint: GET /api/v1/trending-vn/top-universities
 * Response: { data: { window, hot_basis, items: [...] } }
 * Item fields: rank, institution_id, institution_name,
 *              trending_articles_count, first_authors_count,
 *              total_recent_citations, avg_recent_citations,
 *              top_keywords, top_topics, representative_articles
 *
 * @param {Object} params
 * @param {number} [params.years=2]      - Lookback window in years (1-10)
 * @param {number} [params.limit=6]      - Number of universities to return (1-50)
 * @param {number} [params.hot_limit=10] - Number of hot keywords/topics used to select trending articles
 */
export const getTopUniversitiesTrendingApi = (params = {}) =>
  httpClient.get('/trending-vn/top-universities', { params });

/**
 * All-time university ranking -- no year restriction.
 * Endpoint: GET /api/v1/trending-vn/ranking/universities
 * Response: { data: { items: [...] } }
 * Item fields: rank, institution_id, institution_name,
 *              total_articles_count, first_authors_count,
 *              total_citations, avg_citations, latest_publication_year
 *
 * @param {Object} params
 * @param {number} [params.limit=6] - Number of universities to return (1-50)
 */
export const getUniversityRankingsApi = (params = {}) =>
  httpClient.get('/trending-vn/ranking/universities', { params });

/**
 * All-time author ranking by h_index and cited_by_count.
 * Endpoint: GET /api/v1/trending-vn/ranking/authors
 * Response: { data: { items: [...] } }
 * Item fields: rank, author_id, display_name, last_known_institution,
 *              h_index, cited_by_count, works_count, local_articles_count
 *
 * @param {Object} params
 * @param {number} [params.limit=5] - Number of authors to return (1-50)
 */
export const getAuthorRankingsApi = (params = {}) =>
  httpClient.get('/trending-vn/ranking/authors', { params });

/**
 * Top articles ranked by composite trending score (hot keywords/topics + citations + citing works).
 * Endpoint: GET /api/v1/trending-vn/trending/articles
 * Response: { data: { window, hot_basis, items: [...] } }
 * Item fields: article_id, title, doi, publication_year, citation_count,
 *              trending_score, journal_name, hot_keywords, hot_topics, authors
 *
 * @param {Object} params
 * @param {number} [params.years=2]      - Lookback window in years (1-10)
 * @param {number} [params.limit=6]      - Number of articles to return (1-50)
 * @param {number} [params.hot_limit=10] - Number of hot keywords/topics used as the basis
 */
export const getTrendingArticlesApi = (params = {}) =>
  httpClient.get('/trending-vn/trending/articles', { params });

/**
 * Top keywords ranked by article count and citations in the database.
 * Endpoint: GET /api/v1/trending-vn/trending/keywords
 * Response: { data: { hot_basis, items: [...] } }
 * Item fields: keyword_id, display_name, article_count,
 *              total_citations, avg_citations, hot_topics
 *
 * @param {Object} params
 * @param {number} [params.limit=7]      - Number of keywords to return (1-50)
 * @param {number} [params.hot_limit=10] - Number of hot topics used to filter keywords
 */
export const getTrendingKeywordsApi = (params = {}) =>
  httpClient.get('/trending-vn/trending/keywords', { params });

/**
 * Fetch prominent keywords for the Keyword Momentum Cloud component.
 * Fallback endpoint used by fetchKeywords() in useTrending.js when the
 * trending/keywords endpoint returns an empty list.
 * Endpoint: GET /api/v1/keywords
 * Response: { data: { data: { items: [...] } | [...] } }  (two possible shapes)
 * Keyword fields: keyword_id, display_name, article_count
 *
 * @param {Object} params
 * @param {number}  [params.limit=7]       - Max keywords to return
 * @param {string}  [params.sort_by]       - Sort field: keyword_id | display_name | article_count
 * @param {string}  [params.sort_order]    - asc | desc
 */
export const getKeywordsApi = (params = {}) =>
  httpClient.get('/keywords', { params });