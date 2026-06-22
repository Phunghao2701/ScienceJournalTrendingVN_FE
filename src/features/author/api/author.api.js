/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\author\api\author.api.js
 */
import api from '../../../shared/services/api';

/**
 * Gọi API lấy danh sách các subject area học thuật.
 * @returns {Promise} Axios promise
 */
export const getSubjectAreasApi = (params = {}) => {
  return api.get('/subject-areas', { params: { limit: 100, ...params } });
};

/**
 * Gọi API lấy phân tích phần trăm đóng góp theo lĩnh vực nghiên cứu của tác giả
 * @param {number|string} id - ID của tác giả
 * @returns {Promise} Axios promise
 */
export const getAuthorAreasBreakdownApi = (id) => {
  return api.get(`/author/${id}/areas-breakdown`);
};

/**
 * Gọi API lấy danh sách các bài báo khoa học đã xuất bản của tác giả
 * @param {number|string} id - ID của tác giả
 * @returns {Promise} Axios promise
 */
export const getAuthorArticlesApi = (id, params = {}) => {
  return api.get(`/author/${id}/articles`, { params });
};

/**
 * Gọi API lấy danh sách xếp hạng tác giả toàn cầu (Leaderboard)
 * @returns {Promise} Axios promise
 */
export const getAuthorLeaderboardApi = (params = {}) => {
  return api.get('/author/leaderboard', { params });
};

/**
 * Gọi API lấy danh sách tác giả đăng ký trong hệ thống (Hỗ trợ phân trang, lọc và tìm kiếm)
 * @param {Object} params - Các tham số tìm kiếm lọc (page, limit, search, sort, subject_area, country)
 * @returns {Promise} Axios promise
 */
export const getAuthorsApi = (params) => {
  return api.get('/author', { params });
};

/**
 * Gọi API lấy thông tin hồ sơ học thuật chi tiết của một tác giả
 * @param {number|string} id - ID của tác giả
 * @returns {Promise} Axios promise
 */
export const getAuthorDetailApi = (id) => {
  return api.get(`/author/${id}`);
};

/**
 * Tạo mới một tác giả
 * @param {Object} data - Dữ liệu tác giả (display_name)
 * @returns {Promise} Axios promise
 */
export const createAuthorApi = (data) => {
  return api.post('/author', data);
};

