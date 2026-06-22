/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\api\keywordApi.js
 */
import api from '../../../shared/services/api';

/**
 * API làm việc với Keyword.
 * Tất cả request đi qua shared axios instance để dùng chung base URL và auth interceptor.
 */
const keywordApi = {
  /**
   * Lấy danh sách keyword có hỗ trợ search, sort và pagination.
   *
   * @param {Object} params - Query params gửi lên backend.
   * @returns {Promise} Axios response từ backend.
   */
  getKeywords(params) {
    return api.get('/keywords', { params });
  },

  /**
   * Lấy chi tiết keyword theo ID.
   *
   * @param {string|number} keywordId - ID của keyword.
   * @returns {Promise} Axios response từ backend.
   */
  getKeywordById(keywordId) {
    return api.get(`/keywords/${keywordId}`);
  },

  /**
   * Lấy danh sách bài báo liên quan đến một keyword.
   *
   * @param {string|number} keywordId - ID của keyword.
   * @param {Object} params - Query params phân trang/sắp xếp.
   * @returns {Promise} Axios response từ backend.
   */
  getArticlesByKeyword(keywordId, params) {
    return api.get(`/keywords/${keywordId}/articles`, { params });
  },
};

export default keywordApi;
