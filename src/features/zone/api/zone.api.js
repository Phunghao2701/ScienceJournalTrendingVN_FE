/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\zone\api\zone.api.js
 */
import api, { publicApi } from '../../../shared/services/api';

/**
 * Get publication volume stats by country
 * @returns {Promise} Axios promise
 */
export const getCountryStatsApi = (params) => {
  return api.get('/zones/countries/stats', { params });
};

/**
 * Get publication volume stats by global regions
 * @param {Object} params - Query params if any
 * @returns {Promise} Axios promise
 */
export const getRegionStatsApi = (params) => {
  return publicApi.get('/zones/regions/stats', { params });
};

/**
 * Get internal regional publication stats within a specific country code
 * @param {string} code - Country code
 * @returns {Promise} Axios promise
 */
export const getCountryRegionStatsApi = (code) => {
  return publicApi.get(`/zones/countries/${code}/regions/stats`);
};

/**
 * Get list of articles by country id
 * @param {string} countryId
 * @param {Object} params
 * @returns {Promise} Axios promise
 */
export const getCountryArticlesApi = (countryId, params) => {
  return publicApi.get('/articles', { params: { ...params, country_id: countryId } });
};
