import * as projectApi from '../../project/api/project.api';

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
    return res.data?.keywords || [];
  },

  /**
   * Lấy các bài báo liên quan đến các keyword đang theo dõi
   * @param {number|string} projectId - ID dự án
   * @returns {Promise<Array>} Danh sách bài báo
   */
  async getWatchedKeywordArticles(projectId) {
    const res = await projectApi.getWatchedKeywordArticlesApi(projectId);
    return res.data?.articles || [];
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
