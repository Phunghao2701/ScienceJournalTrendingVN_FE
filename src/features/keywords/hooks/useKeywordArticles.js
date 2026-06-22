/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\hooks\useKeywordArticles.js
 */
import { useState, useEffect, useCallback } from 'react';
import keywordApi from '../api/keywordApi';
import { normalizeKeywordDetailResponse, normalizeKeywordArticlesResponse } from '../services/keywordService';

const DEFAULT_LIMIT = 10;

/**
 * Hook quản lý dữ liệu trang bài báo theo Keyword.
 *
 * @param {string|number} keywordId - ID của keyword từ URL params.
 */
export function useKeywordArticles(keywordId) {
  const [keyword, setKeyword] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_LIMIT, total: 0, total_pages: 1 });
  const [loadingKeyword, setLoadingKeyword] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [keywordError, setKeywordError] = useState(null);
  const [articlesError, setArticlesError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('publication_year');
  const [sortOrder, setSortOrder] = useState('desc');

  /**
   * Lấy thông tin chi tiết keyword.
   */
  const fetchKeywordDetail = useCallback(async () => {
    if (!keywordId) return;
    setLoadingKeyword(true);
    setKeywordError(null);
    try {
      const response = await keywordApi.getKeywordById(keywordId);
      const normalized = normalizeKeywordDetailResponse(response);
      setKeyword(normalized);
    } catch (err) {
      console.error('API error fetching keyword detail:', err);
      setKeywordError(err.response?.data?.message || err.message || 'Không tìm thấy keyword.');
    } finally {
      setLoadingKeyword(false);
    }
  }, [keywordId]);

  /**
   * Lấy danh sách bài báo liên quan đến keyword với phân trang và sắp xếp.
   *
   * @param {number} page - Trang hiện tại.
   */
  const fetchArticles = useCallback(async (page = 1) => {
    if (!keywordId) return;
    setLoadingArticles(true);
    setArticlesError(null);
    try {
      const response = await keywordApi.getArticlesByKeyword(keywordId, {
        page,
        limit: DEFAULT_LIMIT,
        sortBy,
        sortOrder,
      });
      const normalized = normalizeKeywordArticlesResponse(response, DEFAULT_LIMIT);
      setArticles(normalized.items);
      setPagination(normalized.pagination);
    } catch (err) {
      console.error('API error fetching articles by keyword:', err);
      setArticlesError(err.response?.data?.message || err.message || 'Không thể tải danh sách bài báo.');
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  }, [keywordId, sortBy, sortOrder]);

  /**
   * Chuyển trang bài báo.
   *
   * @param {number} nextPage - Trang cần chuyển đến.
   */
  const handlePageChange = useCallback((nextPage) => {
    setCurrentPage(nextPage);
  }, []);

  /**
   * Cập nhật cách sắp xếp bài báo.
   *
   * @param {string} nextSortBy - Field sort.
   * @param {string} nextSortOrder - Hướng sort.
   */
  const handleSortChange = useCallback((nextSortBy, nextSortOrder) => {
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchKeywordDetail();
  }, [fetchKeywordDetail]);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [fetchArticles, currentPage]);

  return {
    keyword,
    articles,
    pagination,
    currentPage,
    sortBy,
    sortOrder,
    loadingKeyword,
    loadingArticles,
    keywordError,
    articlesError,
    handlePageChange,
    handleSortChange,
  };
}
