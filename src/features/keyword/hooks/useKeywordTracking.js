import { useState, useCallback, useEffect } from 'react';
import keywordService from '../services/keywordService';
import projectService from '../../project/services/projectService';
import { useProjectText } from '../../project/i18n/useProjectText';

export const useKeywordTracking = (projectId) => {
  const p = useProjectText();
  const [project, setProject] = useState(null);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [watchArticles, setWatchArticles] = useState([]);
  const [watchedKeywords, setWatchedKeywords] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Lấy toàn bộ dữ liệu cần thiết cho màn hình Keyword Tracking
   */
  const fetchAllData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Get Project Detail
      const pData = await projectService.getProjectById(projectId);
      const proj = pData?.data || pData || null;
      setProject(proj);
      
      let kwData = proj?.watched_keywords || proj?.keywords || [];
      if (typeof kwData === 'string') {
        kwData = kwData.split(',').map(s => s.trim()).filter(Boolean);
      }
      setWatchedKeywords(Array.isArray(kwData) ? kwData : []);

      // 2. Get Trending Keywords
      const tData = await keywordService.getTrendingKeywords(projectId);
      setTrendingKeywords(Array.isArray(tData) ? tData : []);

      // 3. Get Watch Articles
      const aData = await keywordService.getWatchedKeywordArticles(projectId);
      setWatchArticles(Array.isArray(aData) ? aData : []);

    } catch (err) {
      console.error("Error fetching keyword tracking data", err);
      setError(p('unableLoad'));
    } finally {
      setLoading(false);
    }
  }, [projectId, p]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /**
   * Thêm một keyword vào danh sách theo dõi
   * @param {string} keywordStr Tên keyword
   */
  const addKeywordWatch = async (keywordStr) => {
    setActionLoading(true);
    try {
      const keyword = await keywordService.findKeywordByName(keywordStr);
      if (!keyword?.keyword_id) {
        throw new Error('Không tìm thấy từ khóa này trong hệ thống. Vui lòng nhập đúng tên keyword.');
      }
      await keywordService.watchKeywords(projectId, [Number(keyword.keyword_id)]);
      await fetchAllData();
      return true;
    } catch (err) {
      console.error("Error adding keyword", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Bỏ theo dõi một keyword
   * @param {number|string} keywordId ID của keyword
   */
  const removeKeywordWatch = async (keywordId) => {
    setActionLoading(true);
    try {
      await keywordService.unwatchKeyword(projectId, keywordId);
      await fetchAllData();
      return true;
    } catch (err) {
      console.error("Error removing keyword", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    project,
    trendingKeywords,
    watchArticles,
    watchedKeywords,
    loading,
    error,
    actionLoading,
    addKeywordWatch,
    removeKeywordWatch,
    refetch: fetchAllData
  };
};
