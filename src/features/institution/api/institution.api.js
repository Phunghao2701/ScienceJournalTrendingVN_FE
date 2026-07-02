/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\institution\api\institution.api.js
 */
import api from '../../../shared/services/api';

/**
 * Lấy danh sách cơ sở giáo dục Việt Nam (Institution), hỗ trợ tìm kiếm và phân trang.
 * @param {Object} params - { page, limit, search }
 * @returns {Promise} Axios promise
 */
export const getInstitutionsApi = (params = {}) => {
  return api.get('/institution', { params: { limit: 100, ...params } });
};
