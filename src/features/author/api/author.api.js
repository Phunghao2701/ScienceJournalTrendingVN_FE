/**
 * Author API: endpoints for author profiles, articles, subject-area breakdowns, and global leaderboard.
 *
 * File: src/features/author/api/author.api.js
 */
import api from '../../../shared/services/api';

/**
 * Fetch the list of academic subject areas.
 * @param {Object} params - Optional query params (default limit: 100)
 * @returns {Promise} Axios promise
 */
export const getSubjectAreasApi = (params = {}) => {
  return api.get('/subject-areas', { params: { limit: 100, ...params } });
};

/**
 * Fetch subject-area contribution breakdown for an author (percentages per field).
 * @param {number|string} id - Author ID
 * @returns {Promise} Axios promise
 */
export const getAuthorAreasBreakdownApi = (id) => {
  return api.get(`/author/${id}/areas-breakdown`);
};

/**
 * Fetch the list of published articles for an author.
 * @param {number|string} id - Author ID
 * @param {Object} params - Optional pagination/filter params
 * @returns {Promise} Axios promise
 */
export const getAuthorArticlesApi = (id, params = {}) => {
  return api.get(`/author/${id}/articles`, { params });
};

/**
 * Fetch the global author leaderboard.
 * @param {Object} params - Optional filter params (limit, subject_area, etc.)
 * @returns {Promise} Axios promise
 */
export const getAuthorLeaderboardApi = (params = {}) => {
  return api.get('/author/leaderboard', { params });
};

/**
 * Fetch the list of registered authors with pagination, filtering, and search.
 * @param {Object} params - Query params (page, limit, search, sort, subject_area, country)
 * @returns {Promise} Axios promise
 */
export const getAuthorsApi = (params) => {
  return api.get('/author', { params });
};

/**
 * Fetch full academic profile for a single author.
 * @param {number|string} id - Author ID
 * @returns {Promise} Axios promise
 */
export const getAuthorDetailApi = (id) => {
  return api.get(`/author/${id}`);
};

/**
 * Create a new author record.
 * @param {Object} data - Author data (display_name, etc.)
 * @returns {Promise} Axios promise
 */
export const createAuthorApi = (data) => {
  return api.post('/author', data);
};

