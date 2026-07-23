import * as projectApi from '../../project/api/project.api';
import keywordApi from '../../keywords/api/keywordApi';
import { normalizeKeywordListResponse } from '../../keywords/services/keywordService';

/**
 * Service xử lý logic Keyword Tracking (Trending, Watch List, Articles)
 */
const keywordService = {
  /**
   * Lấy danh sách keyword trending của dự án
   * @param {number|string} projectId - ID dự án
   * @param {number} limit - Giới hạn số lượng
   * @param {string} sortBy - Tiêu chí sắp xếp
   * @returns {Promise<Array>} Danh sách keyword
   */
  async getTrendingKeywords(projectId, limit = 20, sortBy = 'count') {
    const res = await projectApi.getTrendingKeywordsApi(projectId, limit, sortBy);
    return res.data?.data?.keywords || res.data?.keywords || [];
  },

  /**
   * Lấy các bài báo liên quan đến các keyword đang theo dõi
   * @param {number|string} projectId - ID dự án
   * @returns {Promise<Array>} Danh sách bài báo
   */
  async getWatchedKeywordArticles(projectId) {
    const firstResponse = await projectApi.getWatchedKeywordArticlesApi(projectId, 1, 50);
    const firstItems = firstResponse.data?.data || firstResponse.data?.articles || [];
    const totalPages = Number(firstResponse.data?.pagination?.total_pages || 1);

    if (totalPages <= 1) return firstItems;

    const remainingResponses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        projectApi.getWatchedKeywordArticlesApi(projectId, index + 2, 50)),
    );

    return remainingResponses.reduce(
      (items, response) => items.concat(response.data?.data || response.data?.articles || []),
      firstItems,
    );
  },

  /**
   * Theo dõi danh sách keyword mới
   * @param {number|string} projectId - ID dự án
   * @param {Array<string>} keywordsList - Danh sách keyword
   * @returns {Promise<Object>} Kết quả trả về
   */
  async watchKeywords(projectId, keywordsList) {
    const res = await projectApi.watchKeywordsApi(projectId, keywordsList);
    return res.data;
  },

  /**
   * Tìm keyword hiện có theo tên để lấy ID mà API watch-list yêu cầu.
   */
  async findKeywordByName(keywordName) {
    const normalizedName = keywordName.trim().toLocaleLowerCase();
    const response = await keywordApi.getKeywords({
      keyword: keywordName.trim(),
      page: 1,
      limit: 20,
    });
    const { items } = normalizeKeywordListResponse(response, 20);

    return items.find(
      (item) => item.display_name?.trim().toLocaleLowerCase() === normalizedName,
    ) || null;
  },

  /**
   * Cập nhật toàn bộ danh sách keyword đang theo dõi
   * @param {number|string} projectId - ID dự án
   * @param {Array<string>} keywordsList - Danh sách keyword
   * @returns {Promise<Object>} Kết quả trả về
   */
  async updateWatchedKeywords(projectId, keywordsList) {
    const res = await projectApi.updateWatchedKeywordsApi(projectId, keywordsList);
    return res.data;
  },

  /**
   * Xóa một keyword khỏi danh sách theo dõi
   * @param {number|string} projectId - ID dự án
   * @param {number|string} keywordId - ID keyword
   * @returns {Promise<Object>} Kết quả trả về
   */
  async unwatchKeyword(projectId, keywordId) {
    const res = await projectApi.unwatchKeywordApi(projectId, keywordId);
    return res.data;
  }
};

export default keywordService;
