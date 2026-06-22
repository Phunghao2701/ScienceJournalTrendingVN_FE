/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\topic\api\topic.api.js
 */
import api from '../../../shared/services/api';

/**
 * Get articles belonging to a specific topic ID
 * @param {number|string} id - Topic ID
 * @param {Object} params - Query params
 * @returns {Promise} Axios promise
 */
export const getTopicArticlesApi = (id, params = {}) => {
  return api.get(`/topics/${id}/articles`, { params });
};

/**
 * Lấy chi tiết topic theo id.
 *
 * @param {number|string} id - Topic ID
 * @returns {Promise} Axios response chứa topic detail.
 */
export const getTopicByIdApi = (id) => {
  return api.get(`/topics/${id}`);
};

/**
 * Lấy danh sách topics để hiển thị trong filter bài báo.
 *
 * @param {Object} params - Query params gửi lên backend.
 * @returns {Promise} Axios response chứa danh sách topics.
 */
export const getTopicsApi = (params = {}) => {
  return api.get('/topics', { params });
};
