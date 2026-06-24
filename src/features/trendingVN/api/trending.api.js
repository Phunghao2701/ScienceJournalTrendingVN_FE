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
 * Lấy danh sách keyword nổi bật cho Keyword Momentum Cloud.
 * Endpoint: GET /api/v1/keywords
 * Response: { data: { data: { items: [...] } | [...] } }
 * Fields mỗi keyword: keyword_id, display_name, article_count
 *
 * @param {Object} params
 * @param {number}  [params.limit=20]     - Số keyword tối đa
 * @param {string}  [params.sort_by]      - Sắp xếp theo: keyword_id | display_name | article_count
 * @param {string}  [params.sort_order]   - asc | desc
 */
export const getKeywordsApi = (params = {}) =>
  httpClient.get('/keywords', { params });