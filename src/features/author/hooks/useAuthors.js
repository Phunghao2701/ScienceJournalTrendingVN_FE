/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\author\hooks\useAuthors.js
 */
import { useState, useCallback } from 'react';
import {
  getAuthorsApi,
  getAuthorDetailApi,
  getAuthorAreasBreakdownApi,
  getAuthorArticlesApi,
  getAuthorLeaderboardApi,
  getSubjectAreasApi,
} from '../api/author.api';






// Chuẩn hóa dữ liệu tác giả từ API để các component có thể hiển thị nhất quán.
const normalizeAuthorRecord = (author) => {
  if (!author || typeof author !== 'object') return author;
  const rawName = author.display_name ?? author.full_name ?? author.name ?? '';
  const cleanedName = String(rawName).trim().replace(/^[\s;'"`]+/, '').trim() || 'Tác giả';

  return {
    ...author,
    full_name: cleanedName,
    name: cleanedName,
    institution_1: author.institution_1 ?? author.last_known_institution ?? author.institution ?? '',
    institution_2: author.institution_2 ?? author.department ?? author.affiliation ?? '',
    article_count: author.article_count ?? author.works_count ?? 0,
    citation_count: author.citation_count ?? author.cited_by_count ?? 0,
    homepage: author.homepage ?? author.homepage_url ?? '',
    bio: author.bio ?? author.description ?? '',
    orcid: author.orcid ?? '',
  };
};

const getAuthorMetric = (author, keys = []) => {
  for (const key of keys) {
    const value = Number(author?.[key]);
    if (!Number.isNaN(value)) return value;
  }
  return 0;
};

const sortAuthorsByImpact = (list = []) => {
  return [...list].sort((a, b) => {
    const hIndexDiff = getAuthorMetric(b, ['h_index', 'hindex']) - getAuthorMetric(a, ['h_index', 'hindex']);
    if (hIndexDiff !== 0) return hIndexDiff;

    const citationDiff = getAuthorMetric(b, ['citation_count', 'cited_by_count', 'citations']) - getAuthorMetric(a, ['citation_count', 'cited_by_count', 'citations']);
    if (citationDiff !== 0) return citationDiff;

    return getAuthorMetric(b, ['article_count', 'works_count', 'papers']) - getAuthorMetric(a, ['article_count', 'works_count', 'papers']);
  });
};



const normalizeAreasBreakdown = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.breakdown)) return data.breakdown;
  if (Array.isArray(data?.data)) return data.data;

  // Nếu backend trả về một object chứa metadata và các trường lĩnh vực,
  // chúng ta cố gắng chuyển đổi nó thành mảng phù hợp để component có thể render.
  if (typeof data === 'object') {
    const ignoredKeys = new Set(['author_id', 'orcid', 'display_name', 'full_name', 'name', 'success', 'message']);
    const keys = Object.keys(data).filter((key) => !ignoredKeys.has(key));

    if (keys.length > 0) {
      const items = keys.map((key) => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          return {
            subject_area: value.category_name ?? value.subject_area_name ?? value.subject_area ?? value.display_name ?? value.name ?? key,
            percentage: value.percentage ?? value.percent ?? 0,
            count: value.count ?? value.article_count ?? 0,
            ...value,
          };
        }

        return {
          subject_area: key,
          percentage: Number(value) || 0,
          count: 0,
        };
      });

      if (items.some((item) => item.subject_area || item.percentage || item.count)) {
        return items;
      }
    }

    return [{
      subject_area: data.subject_area ?? data.name ?? 'Lĩnh vực khác',
      percentage: data.percentage ?? data.percent ?? 0,
      count: data.count ?? data.article_count ?? 0,
    }];
  }

  return [];
};

const getPrimarySubjectAreaFromBreakdown = (breakdown = []) => {
  if (!Array.isArray(breakdown) || breakdown.length === 0) return '';
  const first = [...breakdown].sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))[0];
  return first.category_name ?? first.subject_area ?? first.subject_area_name ?? first.name ?? first.display_name ?? '';
};

const enrichLeaderboardAuthors = (authors = [], breakdownMap = {}) => {
  return authors.map((author) => {
    const id = author.author_id ?? author.id;
    const breakdown = breakdownMap[id] || [];
    const primarySubjectArea = author.subject_area ?? author.field ?? author.area ?? getPrimarySubjectAreaFromBreakdown(breakdown);

    return {
      ...author,
      breakdown,
      primary_subject_area: primarySubjectArea,
    };
  });
};

const extractItemsFromCollectionPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const extractPaginationFromPayload = (responseData, payload = {}) => {
  return responseData?.pagination || payload?.pagination || {};
};

const normalizeSubjectAreaItems = (payload) => {
  const items = extractItemsFromCollectionPayload(payload);
  return items.map((item) => ({
    ...item,
    subject_area_id: item?.subject_area_id ?? item?.id ?? '',
    display_name: item?.display_name ?? item?.name ?? '',
  }));
};

/**
 * Hook quản lý trạng thái tùy chỉnh chính cho mô-đun Tác giả.
 * 
 * @returns {Object} Các trạng thái, cờ loading, đối tượng lỗi và các hàm kích hoạt gọi API.
 */
export default function useAuthors() {
  // ── CÁC TRẠNG THÁI DỮ LIỆU CHÍNH ───────────────────────────────────────────
  const [authors, setAuthors] = useState([]);                      // Danh sách tác giả hiển thị trên trang danh sách/lưới
  const [totalAuthors, setTotalAuthors] = useState(0);              // Tổng số lượng tác giả phục vụ tính toán phân trang
  const [totalPages, setTotalPages] = useState(1);                  // Tổng số trang từ API pagination
  const [currentAuthor, setCurrentAuthor] = useState(null);          // Thông tin hồ sơ chi tiết của tác giả đang được xem
  const [authorArticles, setAuthorArticles] = useState([]);          // Danh sách bài báo được viết bởi tác giả đang được xem
  const [authorBreakdown, setAuthorBreakdown] = useState([]);         // Chỉ số đóng góp của các lĩnh vực nghiên cứu
  const [subjectAreas, setSubjectAreas] = useState([]);               // Danh sách subject area cho bộ lọc
  const [leaderboard, setLeaderboard] = useState([]);                // Danh sách bảng xếp hạng các tác giả hàng đầu
  const [leaderboardBreakdowns, setLeaderboardBreakdowns] = useState({}); // Breakdown theo tác giả cho leaderboard

  // ── CÁC TRẠNG THÁI LOADING RIÊNG BIỆT ──────────────────────────────────────
  // Mỗi quá trình tải dữ liệu có cờ loading spinner/skeleton riêng để tránh làm nghẽn giao diện.
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [loadingAuthorDetail, setLoadingAuthorDetail] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingSubjectAreas, setLoadingSubjectAreas] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // ── CÁC TRẠNG THÁI LỖI RIÊNG BIỆT ─────────────────────────────────────────
  // Lỗi biệt lập ngăn các endpoint bị lỗi làm gián đoạn các phần chức năng khác trên trang.
  const [errorAuthors, setErrorAuthors] = useState(null);
  const [errorAuthorDetail, setErrorAuthorDetail] = useState(null);
  const [errorArticles, setErrorArticles] = useState(null);
  const [errorAreas, setErrorAreas] = useState(null);
  const [errorSubjectAreas, setErrorSubjectAreas] = useState(null);
  const [errorLeaderboard, setErrorLeaderboard] = useState(null);

  // ── 1. Lấy danh sách tác giả kèm theo bộ lọc ─────────────────────────────────
  /**
   * Lấy danh sách tác giả từ backend API.
   * 
   * @param {Object} [params={}] - Tham số bộ lọc truy vấn.
   * @returns {Promise<void>}
   */
  const fetchAuthors = useCallback(async (params = {}) => {
    setLoadingAuthors(true);
    setErrorAuthors(null);
    try {
      const response = await getAuthorsApi(params);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        const payload = response.data.data;
        const items = extractItemsFromCollectionPayload(payload);
        const normalizedItems = items.map(normalizeAuthorRecord);
        const pagination = extractPaginationFromPayload(response.data, payload);
        const total = pagination.total ?? payload?.total ?? normalizedItems.length;
        const limit = pagination.limit ?? (parseInt(params.limit || '1', 10) || normalizedItems.length || 1);

        const sortedItems = (() => {
          if (params.sort === 'impact' || params.sort === 'h_index') return sortAuthorsByImpact(normalizedItems);
          if (params.sort === 'articles') {
            return [...normalizedItems].sort((a, b) => getAuthorMetric(b, ['article_count', 'works_count', 'papers']) - getAuthorMetric(a, ['article_count', 'works_count', 'papers']));
          }
          if (params.sort === 'citations') {
            return [...normalizedItems].sort((a, b) => getAuthorMetric(b, ['citation_count', 'cited_by_count', 'citations']) - getAuthorMetric(a, ['citation_count', 'cited_by_count', 'citations']));
          }
          return normalizedItems;
        })();

        setAuthors(sortedItems);
        setTotalAuthors(total);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } else {
        throw new Error(response.data?.message || 'Failed to fetch authors');
      }
    } catch (err) {
      console.warn('API error fetching authors list:', err?.message || String(err));
      setAuthors([]);
      setTotalAuthors(0);
      setTotalPages(1);
      setErrorAuthors(err?.message || 'Không thể tải danh sách tác giả');
    } finally {
      setLoadingAuthors(false);
    }
  }, []);

  // ── 2. Lấy thông tin chi tiết của một tác giả ────────────────────────────────
  /**
   * Lấy thông tin hồ sơ cơ bản (tiểu sử, tên, học vị) của một tác giả.
   * 
   * @param {string|number} authorId - Mã định danh duy nhất của tác giả.
   * @returns {Promise<void>}
   */
  const fetchAuthorDetail = useCallback(async (authorId) => {
    if (!authorId) return;
    setLoadingAuthorDetail(true);
    setErrorAuthorDetail(null);
    try {
      const response = await getAuthorDetailApi(authorId);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        const rawAuthor = response.data.data || {};
        setCurrentAuthor(normalizeAuthorRecord(rawAuthor));
      } else {
        throw new Error(response.data?.message || 'Failed to fetch author detail');
      }
    } catch (err) {
      console.warn(`API error fetching author detail (id: ${authorId}):`, err?.message || String(err));
      setCurrentAuthor(null);
      setErrorAuthorDetail(err?.message || 'Không thể tải hồ sơ tác giả');
    } finally {
      setLoadingAuthorDetail(false);
    }
  }, []);

  // ── 3. Lấy danh sách bài báo của tác giả ───────────────────────────────────
  /**
   * Lấy danh sách các bài báo nghiên cứu được viết bởi tác giả.
   * 
   * @param {string|number} authorId - Mã định danh duy nhất của tác giả.
   * @returns {Promise<void>}
   */
  const fetchAuthorArticles = useCallback(async (authorId, params = {}) => {
    if (!authorId) return;
    setLoadingArticles(true);
    setErrorArticles(null);
    try {
      const response = await getAuthorArticlesApi(authorId, params);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        const payload = response.data.data;
        setAuthorArticles(extractItemsFromCollectionPayload(payload));
      } else {
        throw new Error(response.data?.message || 'Failed to fetch author articles');
      }
    } catch (err) {
      console.warn(`API error fetching author articles (id: ${authorId}):`, err?.message || String(err));
      setAuthorArticles([]);
      setErrorArticles(err?.message || 'Không thể tải danh sách bài báo của tác giả');
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  // ── 4. Lấy tỷ lệ phân bổ lĩnh vực nghiên cứu của tác giả ─────────────────────
  /**
   * Lấy tỷ lệ phần trăm các danh mục xuất bản phục vụ hiển thị biểu đồ.
   * 
   * @param {string|number} authorId - Mã định danh duy nhất của tác giả.
   * @returns {Promise<void>}
   */
  const fetchAuthorAreasBreakdown = useCallback(async (authorId) => {
    if (!authorId) return;
    setLoadingAreas(true);
    setErrorAreas(null);
    try {
      const response = await getAuthorAreasBreakdownApi(authorId);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        setAuthorBreakdown(normalizeAreasBreakdown(response.data.data));
      } else {
        throw new Error(response.data?.message || 'Failed to fetch areas breakdown');
      }
    } catch (err) {
      console.warn(`API error fetching areas breakdown (id: ${authorId}):`, err?.message || String(err));
      setAuthorBreakdown([]);
      setErrorAreas(err?.message || 'Không thể tải phân bổ lĩnh vực nghiên cứu');
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  const fetchSubjectAreas = useCallback(async (params = {}) => {
    setLoadingSubjectAreas(true);
    setErrorSubjectAreas(null);
    try {
      const response = await getSubjectAreasApi(params);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        const payload = response.data.data;
        setSubjectAreas(normalizeSubjectAreaItems(payload));
      } else {
        throw new Error(response.data?.message || 'Failed to fetch subject areas');
      }
    } catch (err) {
      console.warn('API error fetching subject areas:', err?.message || String(err));
      setSubjectAreas([]);
      setErrorSubjectAreas(err?.message || 'Không thể tải lĩnh vực nghiên cứu');
    } finally {
      setLoadingSubjectAreas(false);
    }
  }, []);

  // ── 5. Lấy danh sách bảng xếp hạng toàn cầu ──────────────────────────────────
  /**
   * Lấy danh sách xếp hạng tác giả nổi bật toàn cầu.
   * 
   * @param {Object} [params={}] - Tham số lọc truy vấn (giới hạn số lượng, lĩnh vực).
   * @returns {Promise<void>}
   */
  const fetchLeaderboard = useCallback(async (params = {}) => {
    setLoadingLeaderboard(true);
    setErrorLeaderboard(null);
    try {
      const response = await getAuthorLeaderboardApi(params);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        const rawData = Array.isArray(response.data.data) ? response.data.data : [];
        const normalizedData = rawData.map(normalizeAuthorRecord);

        const breakdownMap = {};
        await Promise.allSettled(
          normalizedData.map(async (author) => {
            const id = author.author_id ?? author.id;
            if (!id) return;
            try {
              const breakdownResponse = await getAuthorAreasBreakdownApi(id);
              if (breakdownResponse.data && typeof breakdownResponse.data === 'object' && breakdownResponse.data.success !== false) {
                breakdownMap[id] = normalizeAreasBreakdown(breakdownResponse.data.data);
              } else {
                breakdownMap[id] = [];
              }
            } catch (error) {
              breakdownMap[id] = [];
            }
          })
        );

        const enrichedList = enrichLeaderboardAuthors(normalizedData, breakdownMap);
        setLeaderboardBreakdowns(breakdownMap);
        setLeaderboard(enrichedList);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      console.warn('API error fetching leaderboard:', err?.message || String(err));
      setLeaderboard([]);
      setLeaderboardBreakdowns({});
      setErrorLeaderboard(err?.message || 'Không thể tải bảng xếp hạng tác giả');
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  // ── BỘ TẢI TIỆN ÍCH KẾT HỢP ────────────────────────────────────────────────
  /**
   * Hàm trợ giúp để lấy song song toàn bộ thông tin chi tiết của tác giả (Hồ sơ, Bài báo, Lĩnh vực).
   * 
   * @param {string|number} authorId - Mã định danh duy nhất của tác giả.
   * @returns {Promise<void>}
   */
  const fetchAuthorDetailsFull = useCallback(async (authorId) => {
    if (!authorId) return;
    await Promise.all([
      fetchAuthorDetail(authorId),
      fetchAuthorArticles(authorId),
      fetchAuthorAreasBreakdown(authorId),
    ]);
  }, [fetchAuthorDetail, fetchAuthorArticles, fetchAuthorAreasBreakdown]);

  return {
    authors,
    totalAuthors,
    currentAuthor,
    authorArticles,
    authorBreakdown,
    subjectAreas,
    leaderboard,

    // Loading states for selective Spinner/Skeleton displays
    loadingAuthors,
    loadingAuthorDetail,
    loadingArticles,
    loadingAreas,
    loadingSubjectAreas,
    loadingLeaderboard,

    // Error structures for ErrorState banner rendering
    errorAuthors,
    errorAuthorDetail,
    errorArticles,
    errorAreas,
    errorSubjectAreas,
    errorLeaderboard,

    // Async Fetch Trigger Functions
    fetchAuthors,
    fetchAuthorDetail,
    fetchAuthorArticles,
    fetchAuthorAreasBreakdown,
    fetchSubjectAreas,
    fetchLeaderboard,
    totalPages,
    fetchAuthorDetailsFull,
  };
}
