/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\store\keywordFilterStore.js
 */
import { create } from 'zustand';

/**
 * Store quản lý filter, sort và pagination của trang Keywords.
 * Không lưu localStorage để tránh giữ stale filter giữa các phiên làm việc.
 */
export const useKeywordFilterStore = create((set) => ({
  keyword: '',
  page: 1,
  limit: 20,
  sortBy: 'article_count',
  sortOrder: 'desc',
  viewMode: 'list',

  /**
   * Cập nhật keyword tìm kiếm và reset về trang đầu tiên.
   *
   * @param {string} keyword - Từ khóa người dùng nhập.
   */
  setKeyword: (keyword) => {
    set({ keyword, page: 1 });
  },

  /**
   * Cập nhật trang hiện tại.
   *
   * @param {number} page - Trang cần hiển thị.
   */
  setPage: (page) => {
    set({ page });
  },

  /**
   * Cập nhật số lượng item trên mỗi trang và reset về trang đầu.
   *
   * @param {number} limit - Số lượng keyword trên mỗi trang.
   */
  setLimit: (limit) => {
    set({ limit, page: 1 });
  },

  /**
   * Cập nhật cách sắp xếp danh sách keyword.
   *
   * @param {string} sortBy - Field dùng để sort.
   * @param {string} sortOrder - Thứ tự sort: asc hoặc desc.
   */
  setSort: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder, page: 1 });
  },

  /**
   * Cập nhật kiểu hiển thị keyword list.
   *
   * @param {string} viewMode - Kiểu hiển thị, ví dụ list hoặc cloud.
   */
  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  /**
   * Reset filter về trạng thái mặc định.
   */
  clearFilters: () => {
    set({
      keyword: '',
      page: 1,
      limit: 20,
      sortBy: 'article_count',
      sortOrder: 'desc',
      viewMode: 'list',
    });
  },
}));
