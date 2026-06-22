/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\api\catalogApi.js
 */
import api from '../../../shared/services/api';

/**
 * Get catalog academic subject areas list
 * @returns {Promise} Axios promise
 */
export const getSubjectAreasApi = () => {
  return api.get('/subject-areas');
};

/**
 * Get catalog academic subject categories list
 * @param {Object} params - Query params (e.g. limit, page)
 * @returns {Promise} Axios promise
 */
export const getSubjectCategoriesApi = (params) => {
  return api.get('/subject-categories', { params });
};

/**
 * Get historical rankings of a journal by journal ID
 * @param {number|string} id - Journal ID
 * @returns {Promise} Axios promise
 */
export const getJournalRankingsApi = (id) => {
  return api.get(`/catalog/journals/${id}/rankings`);
};

/**
 * Get catalog volumes list (filterable by journal_id)
 * @param {Object} params - { journal_id }
 * @returns {Promise} Axios promise
 */
export const getCatalogVolumesApi = (params) => {
  return api.get('/catalog/volumes', { params });
};

/**
 * Get catalog issues list (filterable by volume_id)
 * @param {Object} params - { volume_id }
 * @returns {Promise} Axios promise
 */
export const getCatalogIssuesApi = (params) => {
  return api.get('/catalog/issues', { params });
};
