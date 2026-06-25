/**
 * File: src/features/trendingVN/api/trending.api.js
 *
 * Cung cấp các hàm gọi API cho tính năng Theo dõi Xu hướng Nghiên cứu (TrendingVN).
 * Dữ liệu được lấy từ hệ thống backend, ban đầu đồng bộ từ các nguồn học thuật
 * như Semantic Scholar, OpenAlex hoặc Crossref.
 *
 * Base URL được cấu hình sẵn trong httpClient (/api/v1).
 */
import httpClient from '../../../shared/services/httpClient';

/**
 * Lấy danh sách bài báo khoa học.
 * Hỗ trợ tìm kiếm theo tiêu đề, lọc theo từ khóa, phân trang và sắp xếp.
 *
 * Nếu KHÔNG truyền keywords → trả về danh sách công khai (không cần token).
 * Nếu CÓ truyền keywords → chuyển sang chế độ tìm kiếm nâng cao (cần Bearer Token).
 *
 * @param {Object} params
 * @param {string}  [params.search]     - Tìm kiếm theo tiêu đề bài báo
 * @param {string}  [params.keywords]   - Danh sách từ khóa cách nhau bởi dấu phẩy
 * @param {number}  [params.page=1]     - Số trang hiện tại
 * @param {number}  [params.limit=10]   - Số bài báo mỗi trang
 * @param {string}  [params.sortBy]     - Trường sắp xếp: article_id | title | publication_year | created_at | doi
 * @param {string}  [params.sortOrder]  - Thứ tự sắp xếp: asc | desc
 */
export const getArticlesApi = (params = {}) =>
  httpClient.get('/articles', { params });

/**
 * Lấy danh sách chủ đề nghiên cứu (Topics).
 * Dùng để hiển thị các chủ đề nổi bật và populate dropdown bộ lọc.
 *
 * @param {Object} params
 * @param {number}  [params.page=1]                - Số trang
 * @param {number}  [params.limit=10]              - Số bản ghi mỗi trang
 * @param {string}  [params.search]                - Tìm kiếm theo tên hiển thị
 * @param {number}  [params.subject_area_id]       - Lọc theo Subject Area ID
 * @param {number}  [params.subject_category_id]   - Lọc theo Subject Category ID
 * @param {string}  [params.sort_by]               - Sắp xếp theo: topic_id | display_name | score
 * @param {string}  [params.sort_order]            - Thứ tự: asc | desc
 */
export const getTopicsApi = (params = {}) =>
  httpClient.get('/topics', { params });

/**
 * Lấy danh sách tạp chí khoa học (Journals).
 * Dùng để hiển thị top journals theo số lượng bài báo và populate dropdown bộ lọc.
 * Yêu cầu đăng nhập (Bearer Token).
 *
 * @param {Object} params
 * @param {string}  [params.search]    - Tìm kiếm theo tên journal
 * @param {number}  [params.page=1]    - Số trang
 * @param {number}  [params.limit=10]  - Số bản ghi mỗi trang
 */
export const getJournalsApi = (params = {}) =>
  httpClient.get('/journal', { params });

/**
 * Lấy bảng xếp hạng tác giả ảnh hưởng nhất (Author Leaderboard).
 * Xếp hạng dựa trên cited_by_count, h_index và works_count.
 * Yêu cầu đăng nhập (Bearer Token).
 *
 * @param {Object} params
 * @param {number}  [params.page=1]    - Trang thứ mấy
 * @param {number}  [params.limit=10]  - Số lượng tác giả tối đa mỗi trang
 */
export const getAuthorsLeaderboardApi = (params = {}) =>
  httpClient.get('/author/leaderboard', { params });

/**
 * Lấy danh sách lĩnh vực học thuật lớn (Subject Areas).
 * Dùng để populate dropdown bộ lọc "Lĩnh vực" trên trang trending.
 */
export const getSubjectAreasApi = () =>
  httpClient.get('/catalog/subject-areas');

/**
 * Lấy danh sách chuyên ngành hẹp (Subject Categories).
 * Dùng để populate dropdown bộ lọc "Chuyên ngành" trên trang trending.
 *
 * @param {Object} params
 * @param {number}  [params.subject_area_id]  - Lọc theo lĩnh vực cha
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=100]
 */
export const getSubjectCategoriesApi = (params = {}) =>
  httpClient.get('/catalog/subject-categories', { params });

/**
 * Top Journals theo trich dan - endpoint moi tu trendingVn service.
 * Lay cac bai bao trong N nam gan nhat, xep hang journal theo tong trich dan.
 * Endpoint: GET /api/v1/trending-vn/top-journals
 * Response: { data: { window: { from_year, to_year, years }, items: [...] } }
 * Fields moi item: journal_id, journal_name, total_recent_citations,
 *                  recent_articles_count, top_keywords, top_topics
 *
 * @param {Object} params
 * @param {number} [params.years=2]  -- So nam gan nhat (1-10)
 * @param {number} [params.limit=7]  -- So journal tra ve (1-50)
 */
export const getTopJournalsTrendingApi = (params = {}) =>
  httpClient.get('/trending-vn/top-journals', { params });

/**
 * Top Universities theo keyword/topic trending va tac gia chinh.
 * Endpoint: GET /api/v1/trending-vn/top-universities
 * Response: { data: { window, hot_basis, items: [...] } }
 * Fields moi item: rank, institution_id, institution_name,
 *                  trending_articles_count, first_authors_count,
 *                  total_recent_citations, avg_recent_citations,
 *                  top_keywords, top_topics, representative_articles
 *
 * @param {Object} params
 * @param {number} [params.years=2]      -- So nam gan nhat (1-10)
 * @param {number} [params.limit=6]      -- So university tra ve (1-50)
 * @param {number} [params.hot_limit=10] -- So keyword/topic hot lam nen chon bai trending
 */
export const getTopUniversitiesTrendingApi = (params = {}) =>
  httpClient.get('/trending-vn/top-universities', { params });

/**
 * Xep hang University toan bo lich su — khong gioi han nam.
 * Endpoint: GET /api/v1/trending-vn/ranking/universities
 * Response: { data: { items: [...] } }
 * Fields: rank, institution_id, institution_name,
 *         total_articles_count, first_authors_count,
 *         total_citations, avg_citations, latest_publication_year
 *
 * @param {Object} params
 * @param {number} [params.limit=6] -- So university tra ve (1-50)
 */
export const getUniversityRankingsApi = (params = {}) =>
  httpClient.get('/trending-vn/ranking/universities', { params });

/**
 * Xep hang Author toan bo lich su theo h_index + cited_by_count.
 * Endpoint: GET /api/v1/trending-vn/ranking/authors
 * Response: { data: { items: [...] } }
 * Fields: rank, author_id, display_name, last_known_institution,
 *         h_index, cited_by_count, works_count, local_articles_count
 *
 * @param {Object} params
 * @param {number} [params.limit=5] -- So author tra ve (1-50)
 */
export const getAuthorRankingsApi = (params = {}) =>
  httpClient.get('/trending-vn/ranking/authors', { params });

/**
 * Top Articles theo trending score (keyword/topic hot + citation + citing works).
 * Endpoint: GET /api/v1/trending-vn/trending/articles
 * Response: { data: { window, hot_basis, items: [...] } }
 * Fields moi item: article_id, title, doi, publication_year, citation_count,
 *                  trending_score, journal_name, hot_keywords, hot_topics, authors
 *
 * @param {Object} params
 * @param {number} [params.years=2]      -- So nam gan nhat (1-10)
 * @param {number} [params.limit=6]      -- So article tra ve (1-50)
 * @param {number} [params.hot_limit=10] -- So keyword/topic hot lam nen
 */
export const getTrendingArticlesApi = (params = {}) =>
  httpClient.get('/trending-vn/trending/articles', { params });

/**
 * Top Keywords theo so bai bao + citation trong DB.
 * Endpoint: GET /api/v1/trending-vn/trending/keywords
 * Response: { data: { hot_basis, items: [...] } }
 * Fields moi item: keyword_id, display_name, article_count,
 *                  total_citations, avg_citations, hot_topics
 *
 * @param {Object} params
 * @param {number} [params.limit=7]      -- So keyword tra ve (1-50)
 * @param {number} [params.hot_limit=10] -- So topic hot lam nen loc keyword
 */
export const getTrendingKeywordsApi = (params = {}) =>
  httpClient.get('/trending-vn/trending/keywords', { params });

/**
 * Lay danh sach keyword noi bat cho Keyword Momentum Cloud.
 * Endpoint: GET /api/v1/keywords
 * Response: { data: { data: { items: [...] } | [...] } }
 * Fields moi keyword: keyword_id, display_name, article_count
 *
 * @param {Object} params
 * @param {number}  [params.limit=7]       - So keyword toi da
 * @param {string}  [params.sort_by]       - Sap xep theo: keyword_id | display_name | article_count
 * @param {string}  [params.sort_order]    - asc | desc
 */
export const getKeywordsApi = (params = {}) =>
  httpClient.get('/keywords', { params });