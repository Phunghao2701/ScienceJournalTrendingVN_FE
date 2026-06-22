/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\api\landingApi.js
 */
import { publicApi } from '../../../shared/services/api';

/**
 * Calls backend GET /search/:keyword endpoint to query global catalog.
 *
 * @param {string} keyword - The search term
 * @returns {Promise<Object>} Axios response promise
 */
export const searchGlobalApi = (keyword) => {
  return publicApi.get(`/search/${encodeURIComponent(keyword)}`);
};
