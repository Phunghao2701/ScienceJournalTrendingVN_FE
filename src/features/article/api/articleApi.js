/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\api\articleApi.js
 */
import api from '../../../shared/services/api';

/**
 * Lấy danh sách hoặc tìm kiếm bài báo khoa học
 * @param {Object} params - Tham số tìm kiếm, phân trang và sắp xếp (search, page, limit, sortBy, sortOrder)
 * @returns {Promise} Axios promise
 */
export const getArticlesListApi = (params) => {
  return api.get('/articles', { params });
};

/**
 * Tạo mới bài báo khoa học
 * @param {Object} data - Dữ liệu bài báo
 * @returns {Promise} Axios promise
 */
export const createArticleApi = (data) => {
  return api.post('/articles', data);
};

/**
 * Lấy chi tiết bài báo theo ID
 * @param {number|string} id - ID bài báo
 * @returns {Promise} Axios promise
 */
export const getArticleDetailApi = (id) => {
  return api.get(`/articles/${id}`);
};

/**
 * Bookmark an article
 * @param {number|string} id - ID bài báo
 * @returns {Promise} Axios promise
 */
export const bookmarkArticleApi = (id) => {
  return api.post(`/articles/${id}/bookmark`);
};

/**
 * Cập nhật thông tin bài báo khoa học theo ID
 * @param {number|string} id - ID bài báo
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Axios promise
 */
export const updateArticleApi = (id, data) => {
  return api.put(`/articles/${id}`, data);
};

/**
 * Xóa mềm bài báo khoa học theo ID
 * @param {number|string} id - ID bài báo
 * @returns {Promise} Axios promise
 */
export const deleteArticleApi = (id) => {
  return api.delete(`/articles/${id}`);
};

