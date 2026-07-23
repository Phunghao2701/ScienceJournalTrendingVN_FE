/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\project\api\project.api.js
 */
import api from '../../../shared/services/api';

/**
 * Get user projects list
 * @returns {Promise} Axios promise
 */
export const getProjectsApi = () => {
  return api.get('/projects');
};

/**
 * Create a new project
 * @param {Object} data - { title, subject_area, subject_category_ids, journal_ids }
 * @returns {Promise} Axios promise
 */
export const createProjectApi = (data) => {
  return api.post('/projects', data);
};

/**
 * Get project details by ID
 * @param {number|string} id - Project ID
 * @returns {Promise} Axios promise
 */
export const getProjectByIdApi = (id) => {
  return api.get(`/projects/${id}`);
};

/**
 * Update project details by ID
 * @param {number|string} id - Project ID
 * @param {Object} data - { title, subject_area, subject_category_ids, journal_ids }
 * @returns {Promise} Axios promise
 */
export const updateProjectApi = (id, data) => {
  return api.put(`/projects/${id}`, data);
};

/**
 * Delete a project by ID
 * @param {number|string} id - Project ID
 * @returns {Promise} Axios promise
 */
export const deleteProjectApi = (id) => {
  return api.delete(`/projects/${id}`);
};

/**
 * Get project-related articles stream
 * @param {number|string} id - Project ID
 * @param {number} limit - Maximum articles count
 * @returns {Promise} Axios promise
 */
export const getRelatedArticlesApi = (id, limit = 5) => {
  return api.get(`/projects/${id}/related-articles`, {
    params: { limit },
  });
};

/**
 * Get project statistics for charts
 * @param {number|string} id - Project ID
 * @returns {Promise} Axios promise
 */
export const getProjectAnalyticsApi = (id) => {
  return api.get(`/projects/${id}/analytics`);
};

/**
 * Get project top trending keywords
 * @param {number|string} id - Project ID
 * @param {number} limit - Keywords count limit
 * @param {string} sortBy - sort criterion: 'count' or 'score'
 * @returns {Promise} Axios promise
 */
export const getTrendingKeywordsApi = (id, limit = 20, sortBy = 'count') => {
  return api.get(`/projects/${id}/keywords/trending`, {
    params: { limit, sort_by: sortBy },
  });
};

/**
 * Get latest articles from watched keywords
 * @param {number|string} id - Project ID
 * @returns {Promise} Axios promise
 */
export const getWatchedKeywordArticlesApi = (id, page = 1, limit = 50) => {
  return api.get(`/projects/${id}/keywords/watch/articles`, {
    params: { page, limit },
  });
};

/**
 * Watch new keyword list for a project
 * @param {number|string} id - Project ID
 * @param {Array<string>} keywords - Keywords array
 * @returns {Promise} Axios promise
 */
export const watchKeywordsApi = (id, keywordIds) => {
  return api.post(`/projects/${id}/keywords/watch`, { keyword_ids: keywordIds });
};

/**
 * Override/Update keywords watch-list for a project
 * @param {number|string} id - Project ID
 * @param {Array<string>} keywords - Keywords array
 * @returns {Promise} Axios promise
 */
export const updateWatchedKeywordsApi = (id, keywordIds) => {
  return api.put(`/projects/${id}/keywords/watch`, { keyword_ids: keywordIds });
};

/**
 * Unwatch/Remove a keyword from project watch-list
 * @param {number|string} id - Project ID
 * @param {number|string} keywordId - Keyword entry ID
 * @returns {Promise} Axios promise
 */
export const unwatchKeywordApi = (id, keywordId) => {
  return api.delete(`/projects/${id}/keywords/${keywordId}`);
};
