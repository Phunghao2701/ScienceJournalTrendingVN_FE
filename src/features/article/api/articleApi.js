/**
 * Article API: CRUD and supplementary endpoints for academic article resources.
 *
 * File: src/features/article/api/articleApi.js
 */
import api from '../../../shared/services/api';

/**
 * Fetch or search articles with pagination and sorting.
 * @param {Object} params - Query params (search, page, limit, sortBy, sortOrder, publication_year, journal_id, topic_id, access)
 * @returns {Promise} Axios promise
 */
export const getArticlesListApi = (params) => {
  return api.get('/articles', { params });
};

/**
 * Create a new article.
 * @param {Object} data - Article payload
 * @returns {Promise} Axios promise
 */
export const createArticleApi = (data) => {
  return api.post('/articles', data);
};

/**
 * Fetch full detail for a single article by ID.
 * @param {number|string} id - Article ID
 * @returns {Promise} Axios promise
 */
export const getArticleDetailApi = (id) => {
  return api.get(`/articles/${id}`);
};

export const getArticleCitingWorksApi = (id, params = {}) => {
  return api.get(`/articles/${id}/citing-works`, { params });
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
  return api.post(`/articles/${id}/bookmark`);
};

/**
 * Update article metadata by ID.
 * @param {number|string} id - Article ID
 * @param {Object} data - Fields to update
 * @returns {Promise} Axios promise
 */
export const updateArticleApi = (id, data) => {
  return api.put(`/articles/${id}`, data);
};

/**
 * Soft-delete an article by ID.
 * @param {number|string} id - Article ID
 * @returns {Promise} Axios promise
 */
export const deleteArticleApi = (id) => {
  return api.delete(`/articles/${id}`);
};

