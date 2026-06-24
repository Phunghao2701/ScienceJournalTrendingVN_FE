/**
 * Quản lý các lệnh gọi API dành riêng cho tính năng Trending Việt Nam.
 *
 * File: src/features/trendingVN/api/trendingVNApi.js
 */
import api from '../../../shared/services/api';
import { getArticlesListApi } from '../../article/api/articleApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { getTopicsApi } from '../../topic/api/topic.api';

/**
 * Lấy danh sách bài báo khoa học (tương thích từ articleApi)
 * @param {Object} params - Các tham số lọc và phân trang
 * @returns {Promise} Axios promise
 */
export const getTrendingArticlesApi = (params) => {
  return getArticlesListApi(params);
};

/**
 * Tìm kiếm các tạp chí khoa học (tương thích từ journalApi)
 * @param {Object} params - Các tham số lọc và giới hạn
 * @returns {Promise} Axios promise
 */
export const getTrendingJournalsApi = (params) => {
  return searchJournalsApi(params);
};

/**
 * Lấy danh sách các chủ đề khoa học (tương thích từ topic.api)
 * @param {Object} params - Các tham số lọc và giới hạn
 * @returns {Promise} Axios promise
 */
export const getTrendingTopicsApi = (params) => {
  return getTopicsApi(params);
};

/**
 * Lấy danh sách nhà xuất bản từ hệ thống
 * @param {Object} params - Tham số phân trang, giới hạn (ví dụ: { limit: 8 })
 * @returns {Promise} Axios promise
 */
export const getTrendingPublishersApi = (params) => {
  return api.get('/publishers', { params });
};
