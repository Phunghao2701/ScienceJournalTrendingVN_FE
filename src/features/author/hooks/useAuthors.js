/**
 * useAuthors: custom hook managing all Author module state -- list, detail, articles, area breakdowns, and leaderboard.
 *
 * File: src/features/author/hooks/useAuthors.js
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

// === MOCK FALLBACK DATA (matches UI design) ===
// These records are used when the backend API is unavailable (e.g. 404 or network failure).
const MOCK_AUTHORS = [
  {
    id: '1',
    author_id: '1',
    name: 'GS. TS. Nguyễn Văn A',
    full_name: 'GS. TS. Nguyễn Văn A',
    institution_1: 'Đại học Bách Khoa Hà Nội',
    institution_2: 'Viện Công nghệ Thông tin và Truyền thông',
    email: 'a.nguyenvan@hust.edu.vn',
    h_index: 38,
    citation_count: 4520,
    article_count: 124,
    orcid: '0000-0002-1823-4567',
    avatar_color: '#FF7A33', // Orange theme accent
    bio: 'Giáo sư Nguyễn Văn A là chuyên gia hàng đầu về Học máy và Thị giác máy tính tại Việt Nam. Ông đã công bố hơn 100 công trình nghiên cứu trên các tạp chí uy tín và đạt giải thưởng nghiên cứu khoa học xuất sắc.',
    homepage: 'https://example.com/nguyen-van-a',
    subject_areas: ['Machine Learning', 'Computer Vision', 'Healthcare AI']
  },
  {
    id: '2',
    author_id: '2',
    name: 'PGS. TS. Trần Thị B',
    full_name: 'PGS. TS. Trần Thị B',
    institution_1: 'Đại học Quốc gia TP.HCM',
    institution_2: 'Khoa Khoa học & Kỹ thuật Máy tính',
    email: 'ttb@hcmut.edu.vn',
    h_index: 29,
    citation_count: 2980,
    article_count: 87,
    orcid: '0000-0003-4567-8901',
    avatar_color: '#6366F1', // Blue/Purple
    bio: 'Phó giáo sư Trần Thị B chuyên nghiên cứu về Xử lý ngôn ngữ tự nhiên và Khai phá dữ liệu lớn. Bà có nhiều công trình công bố tại các hội nghị quốc tế hàng đầu như ACL, EMNLP.',
    homepage: 'https://example.com/tran-thi-b',
    subject_areas: ['Natural Language Processing', 'Deep Learning', 'Data Mining']
  },
  {
    id: '3',
    author_id: '3',
    name: 'TS. Lê Văn C',
    full_name: 'TS. Lê Văn C',
    institution_1: 'Viện Hàn lâm Khoa học và Công nghệ Việt Nam',
    institution_2: 'Viện Vật lý',
    email: 'lvc@iop.vast.ac.vn',
    h_index: 22,
    citation_count: 1850,
    article_count: 56,
    orcid: '0000-0001-9876-5432',
    avatar_color: '#0EA5E9', // Cyan
    bio: 'Tiến sĩ Lê Văn C là nhà nghiên cứu trẻ xuất sắc trong lĩnh vực Quang học lượng tử và Vật lý laser. Ông có nhiều công trình khoa học công bố trên Nature Photonics và Physical Review Letters.',
    homepage: '',
    subject_areas: ['Quantum Optics', 'Nanophotonics', 'Laser Physics']
  },
  {
    id: '4',
    author_id: '4',
    name: 'Dr. Michael Jordan',
    full_name: 'Dr. Michael Jordan',
    institution_1: 'University of California, Berkeley',
    institution_2: 'Department of EECS',
    email: 'jordan@cs.berkeley.edu',
    h_index: 168,
    citation_count: 215000,
    article_count: 650,
    orcid: '0000-0002-2345-6789',
    avatar_color: '#D97706', // Gold/Dark Yellow
    bio: 'Professor Michael I. Jordan is the Pehong Chen Distinguished Professor in the Department of Electrical Engineering and Computer Sciences and the Department of Statistics at the University of California, Berkeley. He is one of the most influential figures in machine learning and AI.',
    homepage: 'https://people.eecs.berkeley.edu/~jordan/',
    subject_areas: ['Machine Learning', 'Optimization', 'Statistics']
  }
];

// Mock leaderboard records -- article counts and citation counts match MOCK_AUTHORS above.
const MOCK_LEADERBOARD = [
  { id: '1', author_id: '1', name: 'GS. TS. Nguyễn Văn A', subject_area: 'Computer Vision', article_count: 124, citation_count: 4520, papers: 124, citations: 4520 },
  { id: '2', author_id: '2', name: 'PGS. TS. Trần Thị B', subject_area: 'Deep Learning', article_count: 87, citation_count: 2980, papers: 87, citations: 2980 },
  { id: '3', author_id: '3', name: 'TS. Lê Văn C', subject_area: 'Quantum Optics', article_count: 56, citation_count: 1850, papers: 56, citations: 1850 },
  { id: '4', author_id: '4', name: 'Dr. Michael Jordan', subject_area: 'Machine Learning', article_count: 650, citation_count: 215000, papers: 650, citations: 215000 }
];

const createUnknownAuthorFallback = (authorId) => ({
  id: String(authorId),
  author_id: String(authorId),
  name: `Tác giả #${authorId}`,
  full_name: `Tác giả #${authorId}`,
  institution_1: 'Chưa có dữ liệu từ API tác giả',
  institution_2: '',
  email: '',
  h_index: 0,
  citation_count: 0,
  article_count: 0,
  orcid: '',
  avatar_color: '#6366F1',
  bio: 'Hiện chưa tải được hồ sơ chi tiết của tác giả này từ backend.',
  homepage: '',
  subject_areas: []
});

// Mock article lists keyed by author ID, used when the per-author articles API fails.
const MOCK_ARTICLES_MAP = {
  '1': [
    {
      article_id: '1',
      title: 'Attention Is All You Need for Medical Image Classification',
      journal_name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
      publication_year: 2026,
      doi: '10.1109/TPAMI.2026.12345',
      citation_count: 42
    },
    {
      article_id: '2',
      title: 'Deep Convolutional Neural Networks for Malaria Detection',
      journal_name: 'Computer Methods and Programs in Biomedicine',
      publication_year: 2024,
      doi: '10.1016/j.cmpb.2024.54321',
      citation_count: 118
    },
    {
      article_id: '3',
      title: 'A Survey of Federated Learning Paradigms in Healthcare',
      journal_name: 'Future Generation Computer Systems',
      publication_year: 2023,
      doi: '10.1016/j.future.2023.00789',
      citation_count: 230
    }
  ],
  '2': [
    {
      article_id: '4',
      title: 'BERT-based Named Entity Recognition for Vietnamese Electronic Health Records',
      journal_name: 'Journal of Biomedical Informatics',
      publication_year: 2025,
      doi: '10.1016/j.jbi.2025.10425',
      citation_count: 15
    },
    {
      article_id: '5',
      title: 'Deep Learning for Vietnamese Text Summarization: A Comparative Study',
      journal_name: 'Information Processing & Management',
      publication_year: 2024,
      doi: '10.1016/j.ipm.2024.10356',
      citation_count: 38
    }
  ],
  '3': [
    {
      article_id: '6',
      title: 'Coherent Control of Multi-Photon Transitions in Quantum Dot Systems',
      journal_name: 'Nature Photonics',
      publication_year: 2025,
      doi: '10.1038/s41566-025-0123-x',
      citation_count: 48
    },
    {
      article_id: '7',
      title: 'Laser Phase-Space Control of Plasmonic Nanostructures',
      journal_name: 'Physical Review Letters',
      publication_year: 2023,
      doi: '10.1103/PhysRevLett.130.012345',
      citation_count: 85
    }
  ],
  '4': [
    {
      article_id: '8',
      title: 'An Introduction to Variational Autoencoders and Graphical Models',
      journal_name: 'Foundations and Trends in Machine Learning',
      publication_year: 2024,
      doi: '10.1561/2200000099',
      citation_count: 1450
    },
    {
      article_id: '9',
      title: 'Optimization and Statistics in Machine Learning',
      journal_name: 'Annals of Statistics',
      publication_year: 2022,
      doi: '10.1214/22-AOS1234',
      citation_count: 3200
    }
  ]
};

// Normalize an author record from the API into a consistent shape for all components.
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

// Mock subject-area breakdown percentages keyed by author ID.
const MOCK_BREAKDOWNS_MAP = {
  '1': [
    { subject_area: 'Machine Learning', count: 56, percentage: 45 },
    { subject_area: 'Computer Vision', count: 37, percentage: 30 },
    { subject_area: 'Healthcare AI', count: 19, percentage: 15 },
    { subject_area: 'Others', count: 12, percentage: 10 }
  ],
  '2': [
    { subject_area: 'Natural Language Processing', count: 42, percentage: 48 },
    { subject_area: 'Deep Learning', count: 28, percentage: 32 },
    { subject_area: 'Data Mining', count: 17, percentage: 20 }
  ],
  '3': [
    { subject_area: 'Quantum Optics', count: 28, percentage: 50 },
    { subject_area: 'Nanophotonics', count: 18, percentage: 32 },
    { subject_area: 'Laser Physics', count: 10, percentage: 18 }
  ],
  '4': [
    { subject_area: 'Machine Learning', count: 350, percentage: 54 },
    { subject_area: 'Optimization', count: 180, percentage: 28 },
    { subject_area: 'Statistics', count: 120, percentage: 18 }
  ]
};

const normalizeAreasBreakdown = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.breakdown)) return data.breakdown;
  if (Array.isArray(data?.data)) return data.data;

  // If the backend returns a metadata object with field keys, convert it to an array for rendering.
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
 * Primary custom hook for the Author module.
 *
 * @returns {Object} Data states, loading flags, error objects, and async fetch trigger functions.
 */
export default function useAuthors() {
  // === Core data states ===
  const [authors, setAuthors] = useState([]);                      // Author list shown on the directory/grid page
  const [totalAuthors, setTotalAuthors] = useState(0);              // Total author count for pagination calculation
  const [totalPages, setTotalPages] = useState(1);                  // Total pages returned by the API pagination envelope
  const [currentAuthor, setCurrentAuthor] = useState(null);          // Full profile of the author currently being viewed
  const [authorArticles, setAuthorArticles] = useState([]);          // Articles published by the currently viewed author
  const [authorBreakdown, setAuthorBreakdown] = useState([]);         // Subject-area contribution breakdown for the author
  const [subjectAreas, setSubjectAreas] = useState([]);               // Subject area list for the filter dropdown
  const [leaderboard, setLeaderboard] = useState([]);                // Global top-author leaderboard list
  const [leaderboardBreakdowns, setLeaderboardBreakdowns] = useState({}); // Per-author breakdowns for leaderboard enrichment

  // === Per-operation loading flags (each section spins independently) ===
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [loadingAuthorDetail, setLoadingAuthorDetail] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingSubjectAreas, setLoadingSubjectAreas] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // === Per-operation error states (isolated so one failure does not block others) ===
  const [errorAuthors, setErrorAuthors] = useState(null);
  const [errorAuthorDetail, setErrorAuthorDetail] = useState(null);
  const [errorArticles, setErrorArticles] = useState(null);
  const [errorAreas, setErrorAreas] = useState(null);
  const [errorSubjectAreas, setErrorSubjectAreas] = useState(null);
  const [errorLeaderboard, setErrorLeaderboard] = useState(null);

  // --- 1. Fetch author list with filters ---
  /**
   * Fetch the registered author list. Falls back to local mock search if the backend returns an error.
   *
   * @param {Object} [params={}] - Filter/query params (page, limit, search, sort, subject_area, country).
   * @returns {Promise<void>}
   */
  const fetchAuthors = useCallback(async (params = {}) => {
    setLoadingAuthors(true);
    setErrorAuthors(null);
    try {
      const response = await getAuthorsApi(params);
      // Validate response -- guard against Axios/Vite dev-server fallback returning index.html
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
      console.warn('API error fetching authors list, using mock fallback:', err?.message || String(err));
      
      // Local filter/search logic applied to mock fallback data
      const keyword = (params.search || '').toLowerCase().trim();
      const area = (params.subject_area || '').trim();
      const sort = params.sort || '';

      let filtered = [...MOCK_AUTHORS];
      if (keyword) {
        filtered = filtered.filter(a => 
          a.name.toLowerCase().includes(keyword) || 
          (a.institution_1 || '').toLowerCase().includes(keyword) ||
          (a.institution_2 || '').toLowerCase().includes(keyword) ||
          (a.orcid || '').includes(keyword) ||
          a.subject_areas.some(tag => tag.toLowerCase().includes(keyword))
        );
      }
      if (area) {
        filtered = filtered.filter(a => a.subject_areas.includes(area));
      }
      if (sort === 'impact' || sort === 'h_index') {
        filtered = sortAuthorsByImpact(filtered);
      } else if (sort === 'articles') {
        filtered.sort((a, b) => getAuthorMetric(b, ['article_count', 'works_count', 'papers']) - getAuthorMetric(a, ['article_count', 'works_count', 'papers']));
      } else if (sort === 'citations') {
        filtered.sort((a, b) => getAuthorMetric(b, ['citation_count', 'cited_by_count', 'citations']) - getAuthorMetric(a, ['citation_count', 'cited_by_count', 'citations']));
      }

      // Paginate mock results to match requested page/limit
      const page = parseInt(params.page || '1', 10);
      const limit = parseInt(params.limit || '10', 10);
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      setAuthors(paginated);
      setTotalAuthors(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / limit)));
    } finally {
      setLoadingAuthors(false);
    }
  }, []);

  // --- 2. Fetch a single author's detail ---
  /**
   * Fetch the basic profile for one author (bio, name, academic title).
   *
   * @param {string|number} authorId - Unique author identifier.
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
      console.warn(`API error fetching author detail (id: ${authorId}), using mock fallback:`, err?.message || String(err));
      const matched = MOCK_AUTHORS.find(a => String(a.id) === String(authorId));
      setCurrentAuthor(matched || createUnknownAuthorFallback(authorId));
    } finally {
      setLoadingAuthorDetail(false);
    }
  }, []);

  // --- 3. Fetch articles by author ---
  /**
   * Fetch the list of research articles published by an author.
   *
   * @param {string|number} authorId - Unique author identifier.
   * @param {Object} [params={}] - Optional pagination/filter params.
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
      console.warn(`API error fetching author articles (id: ${authorId}), using mock fallback:`, err?.message || String(err));
      const matched = MOCK_ARTICLES_MAP[String(authorId)] || [];
      setAuthorArticles(matched);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  // --- 4. Fetch subject-area breakdown for an author ---
  /**
   * Fetch publication category percentages for chart display.
   *
   * @param {string|number} authorId - Unique author identifier.
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
      console.warn(`API error fetching areas breakdown (id: ${authorId}), using mock fallback:`, err?.message || String(err));
      const matched = MOCK_BREAKDOWNS_MAP[String(authorId)] || [];
      setAuthorBreakdown(matched);
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

  // --- 5. Fetch global author leaderboard ---
  /**
   * Fetch the ranked list of top authors worldwide.
   *
   * @param {Object} [params={}] - Optional filter params (limit, subject_area).
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
      console.warn('API error fetching leaderboard, using mock fallback:', err?.message || String(err));
      let list = [...MOCK_LEADERBOARD];
      
      const area = (params.subject_area || '').trim().toLowerCase();
      if (area) {
        list = list.filter(item => item.subject_area.toLowerCase().includes(area));
      }
      
      // Trim the mock list if a limit is provided (e.g. Dashboard widget)
      if (params.limit) {
        list = list.slice(0, parseInt(params.limit, 10));
      }

      setLeaderboard(list);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  // --- Combined utility loader ---
  /**
   * Convenience helper: fetch all author detail data in parallel (profile, articles, area breakdown).
   *
   * @param {string|number} authorId - Unique author identifier.
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
