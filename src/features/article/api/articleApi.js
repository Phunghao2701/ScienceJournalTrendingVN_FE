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

export const getArticleAnalyticsApi = (params = {}) => {
  return api.get('/articles/analytics', { params });
};

export const getArticleAnalysisApi = (params = {}) => {
  return api.get('/articles/analysis', { params });
};

export const getArticleEntityLabelApi = (entityType, id) => {
  const endpointMap = {
    journal: 'journals',
    publisher: 'publishers',
    author: 'authors',
    topic: 'topics',
    keyword: 'keywords',
  };
  const endpoint = endpointMap[entityType];
  if (!endpoint || !id) {
    return Promise.reject(new Error('Invalid entity label request'));
  }
  return api.get(`/${endpoint}/${id}`);
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

export const getArticleCitingWorksApi = (id, params = {}) => {
  return api.get(`/articles/${id}/citing-works`, { params });
};

export const getArticleCitingWorksAnalyticsApi = (id) => {
  return api.get(`/articles/${id}/citing-works/analytics`);
};

export const getArticleReferencesApi = (id, params = {}) => {
  return api.get(`/articles/${id}/references`, { params });
};

/**
 * Bookmark an article
 * @param {number|string} id - ID bài báo
 * @returns {Promise} Axios promise
 */
export const bookmarkArticleApi = (id) => {
  return Promise.resolve({
    data: {
      success: true,
      localOnly: true,
      message: 'Bookmark is stored locally only for this frontend session.',
      data: { article_id: id },
    },
  });
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

