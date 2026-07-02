/**
 * Journal API: search, detail, volume/issue management, follow, and related catalog endpoints.
 *
 * File: src/features/journal/api/journalApi.js
 */
import api from '../../../shared/services/api';

/**
 * Get detailed information for a journal by ID
 * @param {number|string} id - Journal ID
 * @returns {Promise} Axios promise
 */
export const getJournalByIdApi = (id) => {
  return api.get(`/journal/${id}`);
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

/**
 * Get authenticated volumes list for admin/repository management.
 * @param {Object} params - Query params (page, limit, journal_id, search, sort_by, sort_order)
 * @returns {Promise} Axios promise
 */
export const getVolumesApi = (params = {}) => {
  return api.get('/volumes', { params });
};

/**
 * Get issues list for admin/repository management.
 * @param {Object} params - Query params (page, limit, journal_id, volume_id)
 * @returns {Promise} Axios promise
 */
export const getIssuesApi = (params = {}) => {
  return api.get('/issues', { params });
};

/**
 * Get recent articles for a journal (filterable by journal_id)
 * @param {Object} params - { journal_id }
 * @returns {Promise} Axios promise
 */
export const getJournalArticlesApi = (params) => {
  return api.get('/articles', { params });
};

/**
 * Follow a journal entry by ID
 * @param {number|string} id - Journal ID
 * @returns {Promise} Axios promise
 */
export const followJournalApi = (id) => {
  return api.post(`/journals/${id}/follow`);
};

/**
 * Add a journal entry to a project
 * @param {number|string} projectId - Project ID
 * @param {number|string} journalId - Journal ID
 * @returns {Promise} Axios promise
 */
export const addJournalToProjectApi = (projectId, journalId) => {
  return api.post(`/projects/${projectId}/journals`, { journalId });
};

/**
 * Search journals with filters, pagination, sorting.
 * @param {Object} params - Query params (search, page, limit, sort, subject_area_ids, subject_category_ids, is_open_access, quartiles)
 * @returns {Promise} Axios promise
 */
export const searchJournalsApi = (params) => {
  return api.get('/journal/', { params });
};

/**
 * Create a new journal.
 * @param {Object} data - Journal payload
 * @returns {Promise} Axios promise
 */
export const createJournalApi = (data) => {
  return api.post('/journal', data);
};

/**
 * Update journal metadata by ID.
 * @param {number|string} id - Journal ID
 * @param {Object} data - Fields to update
 * @returns {Promise} Axios promise
 */
export const updateJournalApi = (id, data) => {
  return api.put(`/journal/${id}`, data);
};

/**
 * Delete a journal by ID.
 * @param {number|string} id - Journal ID
 * @returns {Promise} Axios promise
 */
export const deleteJournalApi = (id) => {
  return api.delete(`/journal/${id}`);
};

/**
 * Create a new volume under a journal.
 * @param {Object} data - Volume payload (journal_id, volume_number, publication_year)
 * @returns {Promise} Axios promise
 */
export const createVolumeApi = (data) => {
  return api.post('/volumes', data);
};

/**
 * Create a new issue under a volume.
 * @param {Object} data - Issue payload (volume_id, issue_number, publication_year)
 * @returns {Promise} Axios promise
 */
export const createIssueApi = (data) => {
  return api.post('/issues', data);
};

/**
 * Fetch publishers list.
 * @param {Object} params - Optional filter params
 * @returns {Promise} Axios promise
 */
export const getPublishersApi = (params) => {
  return api.get('/publishers', { params });
};

/**
 * Fetch academic subject areas.
 * @param {Object} params - Optional filter params
 * @returns {Promise} Axios promise
 */
export const getSubjectAreasApi = (params = {}) => {
  return api.get('/subject-areas', { params });
};

/**
 * Fetch subject categories (sub-groups of subject areas).
 * @param {Object} params - Optional filter params
 * @returns {Promise} Axios promise
 */
export const getSubjectCategoriesApi = (params = {}) => {
  return api.get('/subject-categories', { params });
};



