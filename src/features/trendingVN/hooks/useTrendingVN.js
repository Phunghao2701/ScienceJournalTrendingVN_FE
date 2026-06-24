/**
 * Custom hook quản lý dữ liệu và trạng thái của trang xu hướng Việt Nam (TrendingVN).
 * Hook này bọc lại useArticleList để đảm bảo cấu trúc module trendingVN độc lập.
 *
 * File: src/features/trendingVN/hooks/useTrendingVN.js
 */
import useArticleList from '../../article/hooks/useArticleList';

/**
 * Hook chính cung cấp dữ liệu bài báo, bộ lọc và các hàm tương tác cho TrendingVNPage.
 * @returns {Object} Các state và action từ useArticleList
 */
export default function useTrendingVN() {
  // Hiện tại sử dụng chung luồng tải bài viết từ useArticleList.
  // Nếu sau này cần thêm logic xử lý riêng cho Trending VN, chúng ta sẽ viết thêm tại đây.
  return useArticleList();
}
