/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\trendingVN\pages\TrendingVNPage.jsx
 * Mô tả: Trang tìm kiếm bài báo khoa học Việt Nam — bố cục tham chiếu Lens.org.
 *        Gồm: thanh thống kê ngang, toolbar hành động, danh sách card bài báo (trái),
 *        sidebar phân tích với lưới nhà xuất bản, biểu đồ năm, và trạng thái truy cập (phải).
 *        Nút "Analysis" ẩn/hiện sidebar bên phải.
 */

import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Badge, Collapse, Modal, Dropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../landing/components/Header';
import useArticleList from '../../article/hooks/useArticleList';
import ArticleTable from '../../article/components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { getTopicsApi } from '../../topic/api/topic.api';
import PublisherGrid from '../components/PublisherGrid';
import { toast } from '../../../shared/utils/toast';
import { useAuthStore } from '../../../app/store/authStore';
import TrendingPage from './TrendingPage';
import './TrendingVNPage.css';

export default function TrendingVNPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [activeMainTab, setActiveMainTab] = useState('articles'); // 'articles' hoặc 'trending'
  const [activeLeftTab, setActiveLeftTab] = useState(null); // 'filters', 'profile', 'info', 'more'
  const [activeTooltip, setActiveTooltip] = useState(null); // { name, count, x, y }

  // Hook quản lý danh sách bài báo, bộ lọc, phân trang (sync với URL)
  const {
    articles,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    stats,
    filters,
    updateFilters,
    clearFilters,
    handlePageChange,
    handleDetailClick,
  } = useArticleList();

  // --- State giao diện ---
  const [showSidebar, setShowSidebar] = useState(true); // Ẩn/hiện sidebar phân tích
  const [viewMode, setViewMode] = useState('list');      // 'list' hoặc 'table'
  const [expandedAbstracts, setExpandedAbstracts] = useState({}); // Toggle abstract từng bài
  const [allExpanded, setAllExpanded] = useState(false);          // Toggle tất cả abstract
  const [showCustomise, setShowCustomise] = useState(false);      // Ẩn/hiện panel Customise

  // --- State của các tính năng nâng cao (Save Query, Share, Export, Grouping) ---
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [groupingMode, setGroupingMode] = useState('none'); // 'none', 'simple-group', 'simple-expand', 'extended-group', 'extended-expand'

  // State form lưu truy vấn
  const [queryTitle, setQueryTitle] = useState('');
  const [queryDesc, setQueryDesc] = useState('');
  const [queryNotify, setQueryNotify] = useState(false);
  const [queryEmailAlerts, setQueryEmailAlerts] = useState(false);
  const [queryAccess, setQueryAccess] = useState('restricted'); // 'restricted' hoặc 'public'

  // State form xuất dữ liệu
  const [exportDocCount, setExportDocCount] = useState(1000);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [exportFileName, setExportFileName] = useState('articles-export');
  const [exportFields, setExportFields] = useState({
    title: true,
    authors: true,
    journal: true,
    doi: true,
    issn: true,
    keywords: true,
    citations: true,
    year: true,
  });

  // Cấu hình hiển thị cột — chỉ 6 trường theo yêu cầu
  const [visibleColumns, setVisibleColumns] = useState({
    doi: true,
    authors: true,
    article: true,
    journal: true,
    keywords: true,
    issn: true,
  });

  // Toggle ẩn/hiện từng cột trong Customise panel
  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- State bộ lọc (load từ API) ---
  const [journalOptions, setJournalOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  // Input tìm kiếm cục bộ (tránh gọi API liên tục khi gõ)
  const [localSearchInput, setLocalSearchInput] = useState(filters.search);

  // Đồng bộ ô tìm kiếm khi URL thay đổi (back/forward trình duyệt)
  useEffect(() => {
    setLocalSearchInput(filters.search);
  }, [filters.search]);

  // Tải dữ liệu bộ lọc một lần khi mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [journalResponse, topicResponse] = await Promise.allSettled([
          searchJournalsApi({ limit: 100 }),
          getTopicsApi({ limit: 100, sort_by: 'display_name', sort_order: 'asc' })
        ]);

        if (journalResponse.status === 'fulfilled' && journalResponse.value?.data?.success && journalResponse.value?.data?.data?.items) {
          setJournalOptions(journalResponse.value.data.data.items);
        }

        if (topicResponse.status === 'fulfilled' && topicResponse.value?.data?.success) {
          const topicData = topicResponse.value.data;
          const topicItems = topicData?.data?.topics || topicData?.data?.items || topicData?.data || [];
          setTopicOptions(topicItems.filter(item => item.topic_id || item.id));
        }
      } catch (err) {
        console.error('Lỗi khi tải bộ lọc:', err);
      }
    };
    fetchFilterData();
  }, []);

  // Toggle abstract một bài báo
  const toggleAbstract = (id) => {
    setExpandedAbstracts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle tất cả abstract
  const handleToggleAllAbstracts = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newExpanded = {};
    if (nextState) {
      articles.forEach(art => { newExpanded[art.article_id] = true; });
    }
    setExpandedAbstracts(newExpanded);
  };

  // Copy DOI vào clipboard
  const handleCopyDoi = (e, doi) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
  };

  // Lưu truy vấn tìm kiếm hiện tại vào danh sách lưu trữ cục bộ
  const handleSaveQuery = (e) => {
    e.preventDefault();
    if (!queryTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề truy vấn');
      return;
    }

    const newQuery = {
      id: Date.now(),
      title: queryTitle.trim(),
      description: queryDesc.trim(),
      notify: queryNotify,
      emailAlerts: queryEmailAlerts,
      access: queryAccess,
      filters: { ...filters },
      savedAt: new Date().toISOString()
    };

    try {
      const storageKey = 'saved_search_queries';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...existing, newQuery]));
      
      toast.success('Lưu truy vấn thành công!');
      setShowSaveQueryModal(false);
      setQueryTitle('');
      setQueryDesc('');
      setQueryNotify(false);
      setQueryEmailAlerts(false);
    } catch (err) {
      console.error('Lỗi khi lưu truy vấn:', err);
      toast.error('Không thể lưu truy vấn');
    }
  };

  // Thực hiện xuất danh sách bài báo khoa học dựa trên các cột được tích chọn
  const handleExportSubmit = (e) => {
    e.preventDefault();
    
    // Giới hạn số bài báo xuất theo cấu hình của người dùng (mặc định lấy tối đa số bài hiện có)
    const docsToExport = articles.slice(0, exportDocCount);
    if (docsToExport.length === 0) {
      toast.warning('Không có bài báo nào để xuất');
      return;
    }

    let fileContent;
    let mimeType;
    const fileExtension = exportFormat.toLowerCase();

    if (exportFormat === 'CSV') {
      mimeType = 'text/csv;charset=utf-8;';
      
      // Xây dựng header dựa trên các trường được chọn
      const selectedHeaders = [];
      if (exportFields.title) selectedHeaders.push('Title');
      if (exportFields.authors) selectedHeaders.push('Authors');
      if (exportFields.journal) selectedHeaders.push('Journal');
      if (exportFields.doi) selectedHeaders.push('DOI');
      if (exportFields.issn) selectedHeaders.push('ISSN');
      if (exportFields.keywords) selectedHeaders.push('Keywords/Topic');
      if (exportFields.citations) selectedHeaders.push('Citations');
      if (exportFields.year) selectedHeaders.push('Publication Year');

      const csvRows = [selectedHeaders.join(',')];

      // Đưa dữ liệu bài viết vào từng dòng
      docsToExport.forEach(art => {
        const row = [];
        if (exportFields.title) row.push(`"${(art.title || '').replace(/'/g, '""')}"`);
        if (exportFields.authors) {
          const authorNames = (art.authors || []).map(au => au.display_name || au.name).join('; ');
          row.push(`"${authorNames.replace(/'/g, '""')}"`);
        }
        if (exportFields.journal) row.push(`"${(art.journal_name || '').replace(/'/g, '""')}"`);
        if (exportFields.doi) row.push(`"${(art.doi || '').replace(/'/g, '""')}"`);
        if (exportFields.issn) row.push(`"${(art.journal_issn || '').replace(/'/g, '""')}"`);
        if (exportFields.keywords) row.push(`"${(art.primary_topic || '').replace(/'/g, '""')}"`);
        if (exportFields.citations) row.push(art.semantic_citation_count || 0);
        if (exportFields.year) row.push(art.publication_year || '');
        csvRows.push(row.join(','));
      });

      fileContent = csvRows.join('\n');
    } else {
      // Định dạng JSON
      mimeType = 'application/json;charset=utf-8;';
      const jsonList = docsToExport.map(art => {
        const item = {};
        if (exportFields.title) item.title = art.title;
        if (exportFields.authors) item.authors = (art.authors || []).map(au => au.display_name || au.name);
        if (exportFields.journal) item.journal = art.journal_name;
        if (exportFields.doi) item.doi = art.doi;
        if (exportFields.issn) item.issn = art.journal_issn;
        if (exportFields.keywords) item.topic = art.primary_topic;
        if (exportFields.citations) item.citations = art.semantic_citation_count || 0;
        if (exportFields.year) item.publication_year = art.publication_year;
        return item;
      });
      fileContent = JSON.stringify(jsonList, null, 2);
    }

    // Tiến hành tải xuống trình duyệt
    try {
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportFileName || 'export'}.${fileExtension}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Xuất dữ liệu thành công!');
      setShowExportModal(false);
    } catch (err) {
      console.error('Lỗi khi tải file xuất:', err);
      toast.error('Xuất dữ liệu thất bại');
    }
  };

  // Submit form tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: localSearchInput });
  };

  // Xóa ô tìm kiếm
  const handleClearSearch = () => {
    setLocalSearchInput('');
    updateFilters({ search: '' });
  };

  // Tính toán các filter chip đang active
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) {
      chips.push({ key: 'search', label: `${t('search')}: "${filters.search}"`, value: '' });
    }
    if (filters.selectedYear && filters.selectedYear !== 'all') {
      chips.push({ key: 'year', label: `${t('publicationYear')}: ${filters.selectedYear}`, value: 'all' });
    }
    if (filters.selectedJournal && filters.selectedJournal !== 'all') {
      const jName = journalOptions.find(j => String(j.journal_id) === String(filters.selectedJournal))?.display_name || `Journal #${filters.selectedJournal}`;
      chips.push({ key: 'journal', label: `${t('journalLabel')}: ${jName}`, value: 'all' });
    }
    if (filters.selectedTopic && filters.selectedTopic !== 'all') {
      const tName = topicOptions.find(tp => String(tp.topic_id || tp.id) === String(filters.selectedTopic))?.display_name || `Topic #${filters.selectedTopic}`;
      chips.push({ key: 'topic', label: `${t('researchTopics')}: ${tName}`, value: 'all' });
    }
    if (filters.selectedAccess && filters.selectedAccess !== 'all') {
      chips.push({ key: 'access', label: `${t('accessStatus')}: Open Access`, value: 'all' });
    }
    return chips;
  }, [filters, journalOptions, topicOptions, t]);

  const hasActiveFilters = activeChips.length > 0 || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';

  // Tính số bài theo từng năm (dùng cho biểu đồ Publication Date)
  const yearCounts = useMemo(() => {
    const counts = {};
    articles.forEach(art => {
      const y = art.publication_year;
      if (y) counts[y] = (counts[y] || 0) + 1;
    });
    const targetYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
    return targetYears.map(y => ({ year: y, count: counts[y] || 0 }));
  }, [articles]);

  const maxYearCount = useMemo(() => {
    return Math.max(...yearCounts.map(item => item.count)) || 1;
  }, [yearCounts]);

  // Tính Trạng thái pháp lý (Legal Status) động dựa trên danh sách bài báo hiện có
  const legalStatusCounts = useMemo(() => {
    const counts = {
      expired: 0,
      active: 0,
      discontinued: 0,
      pending: 0,
      inactive: 0,
      unknown: 0,
      article: 0 // Thay đổi từ patented sang article theo yêu cầu
    };

    articles.forEach(art => {
      // Phân loại trạng thái động dựa trên các thuộc tính của bài viết (DOI, Open Access, Journal,...)
      if (art.doi) {
        counts.article++;
      }
      
      if (art.is_open_access) {
        if (Number(art.publication_year) >= 2024) {
          counts.active++;
        } else {
          counts.expired++;
        }
      } else {
        counts.inactive++;
      }

      if (!art.journal_name) {
        counts.pending++;
      }

      if (art.journal_id && !art.journal_issn) {
        counts.discontinued++;
      }

      if (!art.publication_year) {
        counts.unknown++;
      }
    });

    return [
      { key: 'expired', label: t('statusExpired'), count: counts.expired, color: '#4ea72a' },
      { key: 'active', label: t('statusActive'), count: counts.active, color: '#ef3335' },
      { key: 'discontinued', label: t('statusDiscontinued'), count: counts.discontinued, color: '#4ea72a' },
      { key: 'pending', label: t('statusPending'), count: counts.pending, color: '#e68800' },
      { key: 'inactive', label: t('statusInactive'), count: counts.inactive, color: '#0099ab' },
      { key: 'unknown', label: t('statusUnknown'), count: counts.unknown, color: '#84939f' },
      { key: 'article', label: t('statusArticle'), count: counts.article, color: '#ef3335' }
    ];
  }, [articles, t]);

  const maxLegalCount = useMemo(() => {
    return Math.max(...legalStatusCounts.map(item => item.count)) || 1;
  }, [legalStatusCounts]);

  // Tính Top tác giả hàng đầu (mô phỏng biểu đồ cột đứng Inventor Name Exact)
  const authorCounts = useMemo(() => {
    const counts = {};
    articles.forEach(art => {
      if (art.authors && Array.isArray(art.authors)) {
        art.authors.forEach(au => {
          const name = au.display_name || au.name;
          if (name) {
            counts[name] = (counts[name] || 0) + 1;
          }
        });
      }
    });
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    return sorted;
  }, [articles]);

  // Tính Top chủ đề hàng đầu (mô phỏng biểu đồ tròn Document Types)
  const topicCounts = useMemo(() => {
    const counts = {};
    articles.forEach(art => {
      const topic = art.primary_topic || t('anyTopic');
      counts[topic] = (counts[topic] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    if (sorted.length <= 5) {
      return sorted;
    }
    const top4 = sorted.slice(0, 4);
    const othersCount = sorted.slice(4).reduce((sum, item) => sum + item.count, 0);
    if (othersCount > 0) {
      top4.push({ name: t('others'), count: othersCount });
    }
    return top4;
  }, [articles, t]);

  // Tính toán góc vẽ cho các sector của hình tròn donut
  const donutSlices = useMemo(() => {
    const totalCount = topicCounts.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) return [];
    
    let currentAngle = 0;
    const colors = ['#1976D2', '#00acc1', '#0ea5e9', '#0288d1', '#5c6bc0', '#90a4ae'];
    
    return topicCounts.map((item, idx) => {
      const percentage = item.count / totalCount;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      
      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        color: colors[idx % colors.length]
      };
    });
  }, [topicCounts]);

  // Gom nhóm danh sách bài viết theo chủ đề nếu ở chế độ gom nhóm Simple/Extended Family
  const groupedArticles = useMemo(() => {
    if (groupingMode !== 'simple-group' && groupingMode !== 'extended-group') {
      return null;
    }
    const groups = {};
    articles.forEach(art => {
      const groupKey = art.primary_topic || t('anyTopic');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(art);
    });
    return Object.entries(groups);
  }, [articles, groupingMode, t]);

  // Helper vẽ đường dẫn của donut slice (SVG path)
  const getDonutSlicePath = (startAngleDeg, endAngleDeg, cx, cy, rOut, rIn) => {
    if (endAngleDeg - startAngleDeg >= 359.9) {
      return `
        M ${cx} ${cy - rOut}
        A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut}
        M ${cx} ${cy - rIn}
        A ${rIn} ${rIn} 0 1 0 ${cx - 0.01} ${cy - rIn}
        Z
      `.trim().replace(/\s+/g, ' ');
    }

    const startAngleRad = ((startAngleDeg - 90) * Math.PI) / 180;
    const endAngleRad = ((endAngleDeg - 90) * Math.PI) / 180;

    const x1_out = cx + rOut * Math.cos(startAngleRad);
    const y1_out = cy + rOut * Math.sin(startAngleRad);
    const x2_out = cx + rOut * Math.cos(endAngleRad);
    const y2_out = cy + rOut * Math.sin(endAngleRad);

    const x1_in = cx + rIn * Math.cos(startAngleRad);
    const y1_in = cy + rIn * Math.sin(startAngleRad);
    const x2_in = cx + rIn * Math.cos(endAngleRad);
    const y2_in = cy + rIn * Math.sin(endAngleRad);

    const largeArcFlag = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

    return `
      M ${x1_in} ${y1_in}
      L ${x1_out} ${y1_out}
      A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out}
      L ${x2_in} ${y2_in}
      A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in}
      Z
    `.trim().replace(/\s+/g, ' ');
  };

  // Helper lấy từ viết tắt của tên tác giả (Initials)
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Format số lớn (ví dụ: 1,234)
  const fmt = (n) => new Intl.NumberFormat().format(n || 0);

  // Render từng thẻ bài viết khoa học (dùng chung cho cả danh sách thường và danh sách gom nhóm)
  const renderArticleCard = (article, index) => {
    const isExpanded = expandedAbstracts[article.article_id] || groupingMode === 'simple-expand' || groupingMode === 'extended-expand';
    const itemIndex = (currentPage - 1) * 10 + index + 1;
    const docId = `VN ${1000000 + Number(article.article_id)} A`;

    return (
      <div key={article.article_id} className="lens-article-card p-3">
        <div className="d-flex align-items-start gap-2">
          {/* Checkbox + số thứ tự */}
          <div className="d-flex flex-column align-items-center gap-1 pt-1" style={{ minWidth: '28px' }}>
            <Form.Check type="checkbox" className="lens-checkbox-sm" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {itemIndex}
            </span>
          </div>

          {/* Nội dung bài báo */}
          <div className="flex-grow-1 min-w-0">
            {/* Tiêu đề bài báo (link xanh) — ẩn/hiện theo checkbox Article */}
            {visibleColumns.article && (
              <div
                className="lens-article-title"
                onClick={() => handleDetailClick(article.article_id)}
              >
                {article.title}
              </div>
            )}

            {/* Dòng meta badges: mã tài liệu, loại, trạng thái */}
            <div className="lens-meta-line">
              <span className="lens-meta-badge">{docId}</span>
              <span>{t('scientificArticle')}</span>
              <span>•</span>
              <span>{t('yearLabel')}: {article.publication_year || '—'}</span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <span className="lens-status-dot" style={{ background: '#16a34a' }} />
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{t('statusPublished')}</span>
              </span>
            </div>

            {/* Dòng: Tác giả — ẩn/hiện theo checkbox Authors */}
            {visibleColumns.authors && (
              <div className="lens-detail-line">
                <strong>{t('authorsLabel')}: </strong>
                {article.authors && article.authors.length > 0 ? (
                  article.authors.map((au, aIdx) => (
                    <span key={au.author_id || aIdx} className="text-link">
                      {au.display_name || au.name}
                      {aIdx < article.authors.length - 1 ? '; ' : ''}
                    </span>
                  ))
                ) : (
                  <span style={{ fontStyle: 'italic' }}>{t('anyAuthor')}</span>
                )}
              </div>
            )}

            {/* Dòng: Tạp chí — ẩn/hiện theo checkbox Journal */}
            {visibleColumns.journal && article.journal_name && (
              <div className="lens-detail-line">
                <strong>{t('journalLabel')}: </strong>
                <span
                  className="text-link"
                  onClick={() => navigate(`/journals/${article.journal_id}`)}
                >
                  {article.journal_name}
                </span>
              </div>
            )}

            {/* Dòng: ISSN — ẩn/hiện theo checkbox ISSN */}
            {visibleColumns.issn && article.journal_issn && (
              <div className="lens-detail-line">
                <strong>{t('issnLabel')}: </strong>
                <span style={{ fontFamily: 'monospace' }}>{article.journal_issn}</span>
              </div>
            )}

            {/* Dòng: Keywords/Topic — ẩn/hiện theo checkbox Keywords */}
            {visibleColumns.keywords && article.primary_topic && (
              <div className="lens-detail-line">
                <strong>{t('keywordsLabel')}: </strong>
                <span className="text-link">{article.primary_topic}</span>
              </div>
            )}

            {/* Dòng: DOI + Trích dẫn — ẩn/hiện DOI theo checkbox */}
            <div className="lens-detail-line">
              <strong>{t('citedWorksLabel')}:</strong> 0 | {' '}
              <strong>{t('citedByLabel')}:</strong>{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{article.semantic_citation_count || 0}</span> | {' '}
              <strong>{t('citesLabel')}:</strong> 0
              {visibleColumns.doi && article.doi && (
                <>
                  {' | '}
                  <strong>{t('doiLabel')}:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{article.doi}</span>
                  <button
                    style={{ background: 'none', border: 'none', padding: 0, marginLeft: '3px', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onClick={(e) => handleCopyDoi(e, article.doi)}
                    title="Copy DOI"
                  >
                    <Icon icon="lucide:copy" width="10" />
                  </button>
                </>
              )}
            </div>

            {/* Pill badges: Open Access, Abstract, Collection */}
            <div className="lens-pill-row">
              {article.is_open_access && (
                <span className="lens-pill lens-pill-oa">
                  <Icon icon="lucide:lock-open" width="10" />
                  {t('openAccess')}
                </span>
              )}
              <span className="lens-pill lens-pill-pending">
                <Icon icon="lucide:file-text" width="10" />
                {t('statusPublished')}
              </span>
              <span
                className="lens-pill lens-pill-abstract"
                onClick={() => toggleAbstract(article.article_id)}
              >
                <Icon icon="lucide:text" width="10" />
                {t('abstract')}
              </span>
            </div>

            {/* Detailed split-layout collapse block (Lens-style) */}
            <Collapse in={isExpanded}>
              <div className="lens-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
                <Row className="g-3">
                  {/* Left Column: Abstract, Claims, Applicants, Inventors, Classifications */}
                  <Col md={8} className="expanded-left-col">
                    {/* 1. Abstract */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('abstractTitle')}</div>
                      <p className="text-muted text-xs text-justify" style={{ lineHeight: '1.5', margin: 0 }}>
                        {article.abstract || t('anyTopic')}
                      </p>
                    </div>

                    {/* 2. Claims */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('claims')}</div>
                      <p className="text-muted text-xs mb-0" style={{ fontStyle: 'italic' }}>
                        {t('claimsUnavailable')}
                      </p>
                    </div>

                    {/* 3. Applicants & Classifications (Row layout) */}
                    <Row className="mb-3">
                      <Col sm={6}>
                        <div className="expanded-section">
                          <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('publisherExact')}</div>
                          <div className="text-xs text-primary d-flex align-items-center gap-1 font-semibold">
                            <Icon icon="lucide:building-2" width="12" />
                            {article.publisher_name || article.journal_name || t('anyJournal')}
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="expanded-section">
                          <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                            {t('ipcClassifications')}
                            <Icon icon="lucide:info" width="12" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                          </div>
                          <div className="text-xs">
                            <span className="badge bg-light text-dark border px-2 py-1 font-monospace" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                              {article.primary_topic || t('anyTopic')}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* 4. Inventors (Authors) */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('authorsLabel')}</div>
                      <div className="d-flex flex-wrap gap-2">
                        {article.authors && article.authors.length > 0 ? (
                          article.authors.map((au, idx) => (
                            <span key={au.author_id || idx} className="text-xs text-primary d-flex align-items-center gap-1 border rounded px-2 py-1 bg-light">
                              <Icon icon="lucide:user" width="12" />
                              {au.display_name || au.name}
                              {au.last_known_institution && (
                                <span className="text-muted font-normal" style={{ fontSize: '0.62rem' }}>
                                  ({au.last_known_institution})
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted font-italic">{t('anyAuthor')}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Document Preview, History */}
                  <Col md={4} className="expanded-right-col border-start ps-3">
                    {/* 1. Document Preview */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('docPreview')}</div>
                      <div className="preview-container border rounded d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center" style={{ minHeight: '160px' }}>
                        <Icon icon="lucide:alert-circle" className="text-danger mb-2" width="24" />
                        <span className="text-xs text-muted fw-bold">{t('noImageYet')}</span>
                      </div>
                    </div>

                    {/* 2. History */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('history')}</div>
                      <div className="history-timeline text-xs d-flex flex-column gap-2">
                        <div className="history-item">
                          <div className="fw-semibold text-dark">{t('publication')}: {article.publication_year || '—'}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                            {docId}
                          </div>
                        </div>
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">{t('application')}: {article.publication_year || '—'}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                            {docId.replace(/\s*[A-Z]$/, '')}
                          </div>
                        </div>
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                            {t('priority')}: {article.publication_year || '—'}
                            <Icon icon="lucide:link" width="10" className="text-muted" />
                          </div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                            {docId.replace(/\s*[A-Z]$/, '')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="trending-vn-page">
      <Header />

      <div className="lens-layout-wrapper">

        {/* ==================== LEFT ICON SIDEBAR (Lens-style) ==================== */}
        {/* Thanh điều hướng dọc bên trái với các icon chức năng */}
        <aside className="lens-left-sidebar">
          {activeLeftTab ? (
            <button className="lens-sidebar-icon-btn active" title={t('close')} onClick={() => setActiveLeftTab(null)}>
              <Icon icon="lucide:chevron-left-circle" width="18" />
            </button>
          ) : (
            <button className="lens-sidebar-icon-btn" title={t('home')} onClick={() => navigate('/')}>
              <Icon icon="lucide:home" width="18" />
            </button>
          )}
          <button className={`lens-sidebar-icon-btn ${!activeLeftTab ? 'active' : ''}`} title={t('articleSearch')} onClick={() => setActiveLeftTab(null)}>
            <Icon icon="lucide:chevron-right" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'filters' ? 'active' : ''}`} title={t('filtersLabel')} onClick={() => setActiveLeftTab(activeLeftTab === 'filters' ? null : 'filters')}>
            <Icon icon="lucide:filter" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'profile' ? 'active' : ''}`} title={t('sbWorkArea')} onClick={() => setActiveLeftTab(activeLeftTab === 'profile' ? null : 'profile')}>
            <Icon icon="lucide:user-cog" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'info' ? 'active' : ''}`} title={t('info')} onClick={() => setActiveLeftTab(activeLeftTab === 'info' ? null : 'info')}>
            <Icon icon="lucide:info" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'more' ? 'active' : ''}`} title={t('more')} onClick={() => setActiveLeftTab(activeLeftTab === 'more' ? null : 'more')}>
            <Icon icon="lucide:more-horizontal" width="18" />
          </button>
        </aside>

        {/* ==================== EXPANDED SIDEBAR DRAWER (Lens-style) ==================== */}
        {activeLeftTab && (
          <aside className="lens-expanded-sidebar">
            {/* 1. FILTERS TAB VIEW */}
            {activeLeftTab === 'filters' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('sbFilters')}</span>
                  <Icon icon="lucide:info" className="info-icon" width="14" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                </div>
                <div className="lens-drawer-scrollable">
                  {[
                    { key: 'dateRange', label: t('sbDateRange'), icon: 'lucide:calendar', action: () => {
                      const el = document.querySelector('.lens-sidebar-panel');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'flags', label: t('sbFlags'), icon: 'lucide:flag', action: () => {
                      updateFilters({ selectedAccess: filters.selectedAccess === 'all' ? 'open' : 'all' });
                    }},
                    { key: 'jurisdiction', label: t('sbJurisdiction'), icon: 'lucide:map-pin' },
                    { key: 'applicants', label: t('sbApplicants'), icon: 'lucide:user-check', action: () => {
                      const el = document.querySelector('.publisher-grid-container');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'inventors', label: t('sbInventors'), icon: 'lucide:users', action: () => {
                      const el = document.querySelector('.author-lens-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'owners', label: t('sbOwners'), icon: 'lucide:award' },
                    { key: 'agents', label: t('sbAgents'), icon: 'lucide:briefcase' },
                    { key: 'legalStatus', label: t('sbLegalStatus'), icon: 'lucide:scale', action: () => {
                      const el = document.querySelector('.legal-status-chart');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'docType', label: t('sbDocType'), icon: 'lucide:file-text' },
                    { key: 'citedWorks', label: t('sbCitedWorks'), icon: 'lucide:book-open' },
                    { key: 'biologicals', label: t('sbBiologicals'), icon: 'lucide:dna' },
                    { key: 'classifications', label: t('sbClassifications'), icon: 'lucide:list' },
                    { key: 'docFamily', label: t('sbDocFamily'), icon: 'lucide:folder-git2', action: () => {
                      setGroupingMode(prev => prev === 'none' ? 'simple-group' : 'none');
                    }},
                    { key: 'queryTools', label: t('sbQueryTools'), icon: 'lucide:settings', action: () => {
                      setShowCustomise(prev => !prev);
                    }},
                    { key: 'newSearch', label: t('sbNewSearch'), icon: 'lucide:search', action: () => {
                      handleClearSearch();
                    }}
                  ].map(item => (
                    <div
                      key={item.key}
                      className="lens-drawer-item"
                      onClick={item.action || (() => {})}
                    >
                      <Icon icon={item.icon} width="16" className="item-icon" />
                      <span className="item-label">{item.label}</span>
                      <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PROFILE / WORK AREA TAB VIEW */}
            {activeLeftTab === 'profile' && (
              <div className="lens-drawer-content">
                <div className="lens-profile-block">
                  <div className="lens-profile-avatar">
                    {user?.name ? getInitials(user.name) : 'TM'}
                  </div>
                  <div className="lens-profile-info">
                    <div className="profile-name">{user?.name || user?.username || 'Trí Minh'}</div>
                    <div className="profile-subtitle">
                      {t('personalAccount')}{' '}
                      <span className="text-danger" style={{ fontSize: '0.62rem', display: 'block' }}>
                        ({t('notCommercialUse')})
                      </span>
                    </div>
                  </div>
                  <Icon icon="lucide:chevron-down" width="16" className="text-muted ms-auto" />
                </div>

                <div className="lens-profile-actions">
                  <Dropdown className="flex-fill">
                    <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 font-sans text-xs d-flex align-items-center justify-content-between">
                      {t('sbNewItem')}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-xs">
                      <Dropdown.Item onClick={() => setShowSaveQueryModal(true)}>{t('saveAsQuery')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowExportModal(true)}>{t('export')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Dropdown className="flex-fill">
                    <Dropdown.Toggle variant="primary" size="sm" className="w-100 font-sans text-xs d-flex align-items-center justify-content-between">
                      {t('sbSearch')}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-xs">
                      <Dropdown.Item onClick={() => updateFilters({ sortBy: 'created_at', sortOrder: 'desc' })}>{t('sortDateNewest')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => updateFilters({ selectedAccess: 'open' })}>{t('openAccess')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="lens-drawer-section-title">{t('sbWorkArea')}</div>
                <div className="lens-drawer-scrollable">
                  {[
                    { key: 'savedQueries', label: t('sbSavedQueries'), icon: 'lucide:save', action: () => navigate('/dashboard') },
                    { key: 'searchHistory', label: t('sbSearchHistory'), icon: 'lucide:search' },
                    { key: 'collections', label: t('sbCollections'), icon: 'lucide:folder' },
                    { key: 'dashboards', label: t('sbDashboards'), icon: 'lucide:bar-chart-2' },
                    { key: 'notes', label: t('sbNotes'), icon: 'lucide:file-text' },
                    { key: 'tags', label: t('sbTags'), icon: 'lucide:tag' },
                    { key: 'inventorship', label: t('sbInventorship'), icon: 'lucide:award' },
                    { key: 'authorship', label: t('sbAuthorship'), icon: 'lucide:users' },
                    { key: 'notifications', label: t('sbNotifications'), icon: 'lucide:bell' },
                    { key: 'mediaLibrary', label: t('sbMediaLibrary'), icon: 'lucide:image' },
                    { key: 'settings', label: t('sbSettings'), icon: 'lucide:settings', action: () => navigate('/profile') }
                  ].map(item => (
                    <div
                      key={item.key}
                      className="lens-drawer-item"
                      onClick={item.action || (() => {})}
                    >
                      <Icon icon={item.icon} width="16" className="item-icon" />
                      <span className="item-label">{item.label}</span>
                      <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. INFO / SUPPORT / SUGGESTIONS VIEW */}
            {activeLeftTab === 'info' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('sbSupport')}</span>
                </div>
                
                <div className="px-3 py-2">
                  <p className="text-muted" style={{ fontSize: '0.72rem', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                    {t('sbSupportDesc')}
                  </p>
                  <div className="lens-search-group" style={{ height: '32px' }}>
                    <Form.Control
                      placeholder={t('sbSearchDoc')}
                      className="lens-search-input py-1"
                      style={{ fontSize: '0.78rem' }}
                    />
                    <span className="d-flex align-items-center pe-2">
                      <Icon icon="lucide:search" width="14" className="text-muted" />
                    </span>
                  </div>
                </div>

                <hr className="my-2 text-muted opacity-20" />

                <div className="lens-drawer-header pt-1">
                  <span className="lens-drawer-title">{t('sbSuggestions')}</span>
                  <Icon icon="lucide:info" className="info-icon" width="14" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                </div>

                <div className="lens-drawer-scrollable">
                  <div className="lens-suggestion-item" onClick={() => setShowSaveQueryModal(true)}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:folder-plus" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{t('sbCreateCollection')}</div>
                      <div className="suggestion-desc">{t('sbCreateCollectionDesc')}</div>
                    </div>
                  </div>

                  <div className="lens-suggestion-item" onClick={() => setShowSaveQueryModal(true)}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:save" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{t('sbSaveQuery')}</div>
                      <div className="suggestion-desc">{t('sbSaveQueryDesc')}</div>
                    </div>
                  </div>

                  <div className="lens-suggestion-item" onClick={() => setShowExportModal(true)}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:download-cloud" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{t('sbExportResults')}</div>
                      <div className="suggestion-desc">{t('sbExportResultsDesc')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MORE MENU VIEW */}
            {activeLeftTab === 'more' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('more')}</span>
                </div>
                <div className="lens-drawer-scrollable">
                  <div className="lens-drawer-item" onClick={() => navigate('/')}>
                    <Icon icon="lucide:home" width="16" className="item-icon" />
                    <span className="item-label">{t('home')}</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/journals')}>
                    <Icon icon="lucide:book-open" width="16" className="item-icon" />
                    <span className="item-label">{t('journals')}</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/trends')}>
                    <Icon icon="lucide:trending-up" width="16" className="item-icon" />
                    <span className="item-label">{t('trends')}</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/geography')}>
                    <Icon icon="lucide:globe" width="16" className="item-icon" />
                    <span className="item-label">{t('geography')}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="lens-main-content">
        <Container fluid className="px-lg-3 py-0">

        {/* ==================== 1. TOP INFO BAR ==================== */}
        {/* Thanh thông tin trên cùng: tổng số bài báo + link tìm kiếm */}
        <div className="lens-top-info-bar">
          <div className="total-count">
            <Icon icon="lucide:search" width="13" className="me-1" />
            {t('databaseArticlesCount', { count: fmt(stats.totalArticles) })}
          </div>
          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
            {t('exploreSectors')}
          </div>
        </div>

        {/* ==================== 2. PAGE TITLE ==================== */}
        <h1 className="lens-page-title">{t('articleSearchResults')}</h1>

        {/* ==================== 3. FILTER INDICATOR ==================== */}
        {/* Hiển thị tổng số kết quả + trạng thái filter */}
        <div className="lens-filter-indicator">
          <span className="filter-count-link" onClick={clearFilters}>
            {t('articles')} ({fmt(total)})
          </span>
          <span>•</span>
          <span>{t('allDocs')}</span>
          <span style={{ marginLeft: '16px' }}>
            <Icon icon="lucide:filter" width="12" className="me-1" />
            {t('filtersLabel')}: {activeChips.length > 0
              ? t('filtersApplied', { count: activeChips.length })
              : t('noFiltersApplied')}
          </span>
        </div>

        {/* ==================== 4. STATS COLOR BAR ==================== */}
        {/* Thanh thống kê ngang — để trống giá trị để người dùng tự điền sau */}
        <div className="lens-stats-bar">
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#00acc1' }} />
            <div className="stat-label">{t('statArticleRecords')}</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#0288d1' }} />
            <div className="stat-label">{t('statSimpleFamilies')}</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#7b1fa2' }} />
            <div className="stat-label">{t('statExtendedFamilies')}</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#c62828' }} />
            <div className="stat-label">{t('statCitedArticles')}</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#ef6c00' }} />
            <div className="stat-label">{t('statCitedByArticles')}</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#2e7d32' }} />
            <div className="stat-label">{t('statArticleCitations')}</div>
            <div className="stat-value">—</div>
          </div>
        </div>

        {/* ==================== 5. MAIN CONTENT (LEFT + RIGHT) ==================== */}
        <Row className="g-0">

          {/* ===== CỘT TRÁI: Tabs + Toolbar + Kết quả ===== */}
          <Col lg={showSidebar ? 8 : 12} md={12} className="transition-col">

            {/* --- Tab row: Articles / Explore Citations / Phân tích + Table/List/Analysis --- */}
            <div className="lens-tab-row">
              <div className="tab-group">
                <button 
                  className={`tab-item ${activeMainTab === 'articles' ? 'active' : ''}`}
                  onClick={() => setActiveMainTab('articles')}
                >
                  {t('articles')}
                </button>
                <button className="tab-item" disabled>
                  {t('exploreCitations')}
                  <Icon icon="lucide:check-check" width="13" style={{ color: '#16a34a' }} />
                </button>
                <button 
                  className={`tab-item ${activeMainTab === 'trending' ? 'active' : ''}`}
                  onClick={() => setActiveMainTab('trending')}
                >
                  <Icon icon="lucide:bar-chart-2" width="13" style={{ marginRight: '4px' }} />
                  {t('analysis')}
                </button>
              </div>
              <div className="view-toggles">
                {activeMainTab === 'articles' && (
                  <>
                    <button
                      className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      <Icon icon="lucide:table" width="13" />
                      {t('viewTable')}
                    </button>
                    <button
                      className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <Icon icon="lucide:list" width="13" />
                      {t('viewList')}
                    </button>
                    <button
                      className={`view-toggle-btn ${showSidebar ? 'active' : ''}`}
                      onClick={() => setShowSidebar(!showSidebar)}
                    >
                      <Icon icon="lucide:bar-chart-3" width="13" />
                      {t('chartLabel')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* --- Action toolbar: Expand, Customise, Save, Share, Export, Sort --- */}
            {activeMainTab === 'articles' && (
            <div className="lens-action-toolbar">
              <div className="action-group">
                <button className="lens-action-btn" onClick={handleToggleAllAbstracts}>
                  <Icon icon={allExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} width="12" />
                  {allExpanded ? t('collapseAbstract') : t('expand')}
                </button>
                <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                <button className="lens-action-btn" onClick={() => setShowCustomise(!showCustomise)}>
                  <Icon icon="lucide:list-checks" width="12" />
                  {t('customiseList')}
                </button>
                <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                <button className="lens-action-btn" onClick={() => setShowSaveQueryModal(true)}>
                  <Icon icon="lucide:save" width="12" />
                  {t('saveAsQuery')}
                </button>
                <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                <button className="lens-action-btn" onClick={() => setShowShareModal(true)}>
                  <Icon icon="lucide:share-2" width="12" />
                  {t('share')}
                </button>
                <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                <button className="lens-action-btn" onClick={() => setShowExportModal(true)}>
                  <Icon icon="lucide:download" width="12" />
                  {t('export')}
                </button>
                <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                <button className="lens-action-btn" disabled>
                  <Icon icon="lucide:sparkles" width="12" />
                  {t('analysisPreviewOptions')}
                  <Badge bg="warning" text="dark" style={{ fontSize: '0.58rem', padding: '1px 4px', marginLeft: '3px' }}>{t('badgeNew')}</Badge>
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="d-flex align-items-center gap-2">
                <Icon icon="lucide:arrow-up-down" width="12" className="text-muted" />
                <select
                  className="lens-sort-select"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    updateFilters({ sortBy, sortOrder });
                  }}
                >
                  <option value="created_at-desc">{t('sortDateNewest')}</option>
                  <option value="created_at-asc">{t('sortDateOldest')}</option>
                  <option value="title-asc">{t('sortTitleAsc')}</option>
                  <option value="title-desc">{t('sortTitleDesc')}</option>
                  <option value="publication_year-desc">{t('sortYearDesc')}</option>
                  <option value="publication_year-asc">{t('sortYearAsc')}</option>
                </select>
              </div>
            </div>
            )}

            {/* --- Panel Customise Your Results View --- */}
            {/* Hiện khi bấm nút "Customise List", chứa 6 checkbox */}
            {activeMainTab === 'articles' && (
            <Collapse in={showCustomise}>
              <div className="lens-customise-panel">
                <div className="customise-title">{t('customiseYourResultsView')}</div>
                <div className="customise-grid">
                  {[
                    { key: 'doi', label: t('colDoi') },
                    { key: 'authors', label: t('colAuthors') },
                    { key: 'article', label: t('colArticle') },
                    { key: 'journal', label: t('colJournal') },
                    { key: 'keywords', label: t('colKeywords') },
                    { key: 'issn', label: t('colIssn') },
                  ].map(col => (
                    <Form.Check
                      key={col.key}
                      type="checkbox"
                      id={`customise-col-${col.key}`}
                      label={col.label}
                      checked={visibleColumns[col.key]}
                      onChange={() => toggleColumn(col.key)}
                      className="customise-check"
                    />
                  ))}
                </div>
              </div>
            </Collapse>
            )}

            {/* --- Active filter chips --- */}
            {activeMainTab === 'articles' && activeChips.length > 0 && (
              <div className="lens-chips-bar">
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('filterSearch')}:</span>
                {activeChips.map(chip => (
                  <span key={chip.key} className="lens-filter-chip">
                    {chip.label}
                    <Icon
                      icon="lucide:x"
                      width="11"
                      className="lens-chip-close"
                      onClick={() => updateFilters({ [chip.key]: chip.value })}
                    />
                  </span>
                ))}
                {hasActiveFilters && (
                  <button className="lens-clear-link" onClick={clearFilters}>
                    {t('clearAll')}
                  </button>
                )}
              </div>
            )}

            {/* ==================== ARTICLES TAB CONTENT ==================== */}
            {activeMainTab === 'articles' && (
            <>
            {/* ==================== SEARCH BAR ==================== */}
            <div className="py-2">
              <Form onSubmit={handleSearchSubmit}>
                <div className="lens-search-group">
                  <span className="d-flex align-items-center ps-3 pe-0" style={{ background: 'transparent' }}>
                    <Icon icon="lucide:search" width="16" className="text-muted" />
                  </span>
                  <Form.Control
                    placeholder={t('searchPlaceholder')}
                    value={localSearchInput}
                    onChange={(e) => setLocalSearchInput(e.target.value)}
                    className="lens-search-input"
                  />
                  {localSearchInput && (
                    <Button variant="link" className="pe-2 text-muted" onClick={handleClearSearch}>
                      <Icon icon="lucide:x" width="14" />
                    </Button>
                  )}
                  <Button type="submit" className="lens-search-btn">
                    {t('search')}
                  </Button>
                </div>
              </Form>
            </div>

            {/* ==================== ARTICLE RESULTS ==================== */}
            <div className="lens-results-body">
              {isLoading && articles.length === 0 ? (
                /* --- Trạng thái Loading: skeleton cards --- */
                <div className="d-flex flex-column gap-0">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="lens-article-card p-3">
                      <div className="lens-skeleton mb-2" style={{ width: '100px', height: '12px' }} />
                      <div className="lens-skeleton mb-2" style={{ width: '80%', height: '16px' }} />
                      <div className="lens-skeleton mb-1" style={{ width: '60%', height: '11px' }} />
                      <div className="lens-skeleton" style={{ width: '40%', height: '11px' }} />
                    </div>
                  ))}
                </div>
              ) : error ? (
                /* --- Trạng thái Lỗi --- */
                <div className="text-center p-5 bg-white border">
                  <Icon icon="lucide:alert-circle" className="text-danger mb-2" width="36" />
                  <h6 style={{ fontWeight: 700 }}>{t('errorOccurred')}</h6>
                  <p className="text-muted" style={{ fontSize: '0.78rem' }}>{error}</p>
                  <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>
                    {t('tryAgain')}
                  </Button>
                </div>
              ) : articles.length === 0 ? (
                /* --- Trạng thái Trống --- */
                <div className="text-center p-5 bg-white border">
                  <Icon icon="lucide:search-x" className="text-muted mb-2" width="36" />
                  <h6 style={{ fontWeight: 700 }}>{t('noArticlesFound')}</h6>
                  <p className="text-muted" style={{ fontSize: '0.78rem' }}>{t('adjustSearchOrReset')}</p>
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                    {t('resetFilters')}
                  </Button>
                </div>
              ) : viewMode === 'list' ? (
                /* ===== CHẾ ĐỘ LIST: Card bài báo theo bố cục Lens ===== */
                <div className="d-flex flex-column gap-0">
                  {groupedArticles ? (
                    // Hiển thị danh sách được gom nhóm (Grouped View)
                    groupedArticles.map(([groupName, groupList]) => (
                      <div key={groupName} className="lens-group-section mb-3 border rounded shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="lens-group-header p-2 d-flex align-items-center justify-content-between bg-light border-bottom">
                          <span className="fw-bold text-xs font-sans text-main d-flex align-items-center">
                            <Icon icon="lucide:folder" className="me-2 text-primary" width="14" />
                            {groupName}
                          </span>
                          <Badge bg="secondary" style={{ fontSize: '0.62rem' }}>
                            {groupList.length} {t('articles').toLowerCase()}
                          </Badge>
                        </div>
                        <div className="d-flex flex-column gap-0">
                          {groupList.map((article, idx) => renderArticleCard(article, idx))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Hiển thị danh sách thường phẳng
                    articles.map((article, index) => renderArticleCard(article, index))
                  )}
                </div>
              ) : (
                /* ===== CHẾ ĐỘ TABLE ===== */
                <div className="bg-white border overflow-hidden">
                  <ArticleTable
                    articles={articles}
                    isLoading={isLoading}
                    onDetailClick={handleDetailClick}
                    onClearFilters={clearFilters}
                  />
                </div>
              )}

              {/* Phân trang */}
              {totalPages > 1 && !isLoading && (
                <div className="lens-pagination-row">
                  <AdminPagination
                    totalItems={total}
                    currentPage={currentPage}
                    limit={10}
                    onPageChange={handlePageChange}
                    entityName={t('articles').toLowerCase()}
                  />
                </div>
              )}
            </div>
            </>
            )}

            {/* ==================== TRENDING TAB CONTENT ==================== */}
            {activeMainTab === 'trending' && (
              <div style={{ width: '100%' }}>
                <TrendingPage />
              </div>
            )}
          </Col>

          {/* ===== CỘT PHẢI: Sidebar phân tích (ẩn/hiện bằng nút Analysis) ===== */}
          {showSidebar && (
            <Col lg={4} md={12} className="lens-sidebar-col">

              {/* --- Panel 1: Applicant Name Exact (lưới nhà xuất bản) --- */}
              <div className="lens-sidebar-panel">
                <PublisherGrid />
              </div>

              {/* --- Panel 2: Publication Date (biểu đồ cột theo năm) --- */}
              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('publicationDate')}</div>
                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div style={{ paddingTop: '4px' }}>
                    <svg viewBox="0 0 200 100" width="100%" height="110px">
                      {/* Elegant background grid lines */}
                      <line x1="8" y1="18" x2="192" y2="18" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="8" y1="38" x2="192" y2="38" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="8" y1="58" x2="192" y2="58" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

                      {yearCounts.map((item, idx) => {
                        const colWidth = 16;
                        const gap = 6;
                        const x = 14 + idx * (colWidth + gap);
                        const colHeight = maxYearCount > 0 ? (item.count / maxYearCount) * 60 : 0;
                        const y = 78 - colHeight;
                        return (
                          <g key={item.year}>
                            <rect
                              x={x} y={y}
                              width={colWidth} height={colHeight}
                              rx="2"
                              fill="#1976D2"
                              opacity="0.85"
                              className="lens-chart-bar"
                            />
                            <text x={x + colWidth / 2} y="92" textAnchor="middle" fontSize="6.5" fill="var(--text-muted)">
                              {item.year}
                            </text>
                            {item.count > 0 && (
                              <text x={x + colWidth / 2} y={y - 3} textAnchor="middle" fontSize="6.5" fontWeight="600" fill="var(--text-main)">
                                {item.count}
                              </text>
                            )}
                          </g>
                        );
                      })}
                      <line x1="8" y1="78" x2="192" y2="78" stroke="var(--border)" strokeWidth="1" />
                    </svg>
                  </div>
                )}
                <div className="lens-chart-hint">
                  <Icon icon="lucide:edit-2" width="10" className="me-1" />
                  {t('chartHint')}
                </div>
              </div>

              {/* --- Panel 2.5: Legal Status (Biểu đồ ngang trạng thái pháp lý) --- */}
              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('legalStatus')}</div>
                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div style={{ paddingTop: '4px' }}>
                    <svg viewBox="0 0 330 220" width="100%" height="200px">
                      {/* Grid lines and Tick labels */}
                      {(() => {
                        const scaleLegalMax = Math.max(5, Math.ceil(maxLegalCount / 5) * 5);
                        const legalTicks = Array.from({ length: 6 }, (_, i) => i * (scaleLegalMax / 5));
                        return legalTicks.map((tickVal) => {
                          const x = 90 + (tickVal / scaleLegalMax) * 220;
                          return (
                            <g key={tickVal}>
                              {/* Dotted vertical grid lines */}
                              <line
                                x1={x}
                                y1={15}
                                x2={x}
                                y2={190}
                                stroke="var(--border)"
                                strokeWidth="0.5"
                                strokeDasharray="3 3"
                                opacity="0.6"
                              />
                              {/* Tick marks at X-axis */}
                              <line
                                x1={x}
                                y1={190}
                                x2={x}
                                y2={194}
                                stroke="var(--border-dark)"
                                strokeWidth="1"
                              />
                              {/* Tick numbers */}
                              <text
                                x={x}
                                y={205}
                                textAnchor="middle"
                                fontSize="7.5"
                                fill="var(--text-muted)"
                              >
                                {fmt(tickVal)}
                              </text>
                            </g>
                          );
                        });
                      })()}

                      {/* X and Y axes lines */}
                      <line x1={90} y1={15} x2={90} y2={190} stroke="var(--border-dark)" strokeWidth="1" />
                      <line x1={90} y1={190} x2={310} y2={190} stroke="var(--border-dark)" strokeWidth="1" />

                      {/* Horizontal Bars & Y-axis labels */}
                      {(() => {
                        const scaleLegalMax = Math.max(5, Math.ceil(maxLegalCount / 5) * 5);
                        const yStep = 175 / legalStatusCounts.length;
                        const barHeight = 12;

                        return legalStatusCounts.map((item, idx) => {
                          const centerOfStep = 15 + (idx + 0.5) * yStep;
                          const y = centerOfStep - barHeight / 2;
                          const barWidth = scaleLegalMax > 0 ? (item.count / scaleLegalMax) * 220 : 0;

                          return (
                            <g key={item.key}>
                              {/* Label on the left of Y-axis */}
                              <text
                                x={82}
                                y={centerOfStep}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize="7.5"
                                fill="var(--text-muted)"
                                fontWeight="600"
                              >
                                {item.label}
                              </text>
                              {/* Bar */}
                              <rect
                                x={90}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={item.color}
                                opacity="0.85"
                                className="lens-chart-bar"
                              >
                                <title>{`${item.label}: ${item.count}`}</title>
                              </rect>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              {/* --- Panel 3: Top Authors (biểu đồ ô - mô phỏng bento grid) --- */}
              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('topAuthors')}</div>
                {authorCounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingTop: '4px' }}>
                    <svg viewBox="0 0 330 260" width="100%" height="240px">
                      {/* Grid lines and Tick labels on Y-axis */}
                      {(() => {
                        const counts = authorCounts.map(item => item.count);
                        const maxVal = Math.max(...counts, 0);
                        const scaleMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
                        const yTicks = Array.from({ length: 6 }, (_, i) => i * (scaleMax / 5));

                        return yTicks.map((tickVal) => {
                          const y = 175 - (tickVal / scaleMax) * 160;
                          return (
                            <g key={tickVal}>
                              {/* Horizontal dotted grid lines */}
                              <line
                                x1={45}
                                y1={y}
                                x2={315}
                                y2={y}
                                stroke="var(--border)"
                                strokeWidth="0.5"
                                strokeDasharray="3 3"
                                opacity="0.6"
                              />
                              {/* Y-axis tick mark line */}
                              <line
                                x1={41}
                                y1={y}
                                x2={45}
                                y2={y}
                                stroke="var(--border-dark)"
                                strokeWidth="1"
                              />
                              {/* Y-axis tick labels */}
                              <text
                                x={37}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize="7.5"
                                fill="var(--text-muted)"
                              >
                                {fmt(tickVal)}
                              </text>
                            </g>
                          );
                        });
                      })()}

                      {/* X and Y axes lines */}
                      <line x1={45} y1={15} x2={45} y2={175} stroke="var(--border-dark)" strokeWidth="1" />
                      <line x1={45} y1={175} x2={315} y2={175} stroke="var(--border-dark)" strokeWidth="1" />

                      {/* Bars & X-axis rotated labels */}
                      {(() => {
                        const counts = authorCounts.map(item => item.count);
                        const maxVal = Math.max(...counts, 0);
                        const scaleMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
                        const greenShades = ['#09542c', '#23884f', '#4fae6f', '#78c68e', '#9fd9ae', '#c2ebcc', '#dbf2e3', '#e8f8ed'];
                        
                        const n = authorCounts.length;
                        const colWidth = 270 / n;
                        const gap = colWidth * 0.25;
                        const barWidth = colWidth - gap;

                        return authorCounts.map((item, idx) => {
                          const x = 45 + idx * colWidth + gap / 2;
                          const barHeight = scaleMax > 0 ? (item.count / scaleMax) * 160 : 0;
                          const y = 175 - barHeight;
                          const color = greenShades[Math.min(idx, greenShades.length - 1)];

                          return (
                            <g key={item.name}>
                              {/* Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                opacity="0.85"
                                className="lens-chart-bar"
                                style={{ transition: 'opacity 0.15s ease', cursor: 'pointer' }}
                                onMouseEnter={() => setActiveTooltip({
                                  name: item.name,
                                  count: item.count,
                                  x: x + barWidth / 2,
                                  y: y
                                })}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                              {/* Rotated text label */}
                              <text
                                transform={`translate(${x + barWidth / 2}, 183) rotate(90)`}
                                textAnchor="start"
                                dominantBaseline="middle"
                                fontSize="7"
                                fill="var(--text-muted)"
                                fontWeight="600"
                              >
                                {item.name}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>

                    {/* Tooltip Overlay */}
                    {activeTooltip && (
                      <div
                        className="chart-tooltip"
                        style={{
                          position: 'absolute',
                          left: `${(activeTooltip.x / 330) * 100}%`,
                          top: `${(activeTooltip.y / 260) * 100}%`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: '-8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-dark)',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          pointerEvents: 'none',
                          zIndex: 10,
                          fontSize: '0.68rem',
                          lineHeight: '1.4',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div style={{ color: 'var(--text-muted)' }}>
                          label: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeTooltip.name}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          Document Count: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{fmt(activeTooltip.count)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* --- Panel 5: Top Topics (biểu đồ hình tròn donut - mô phỏng Document Types) --- */}
              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('topTopics')}</div>
                {topicCounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-3 py-1">
                    <div style={{ width: '84px', height: '84px', flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        {donutSlices.map((slice, idx) => {
                          const pathD = getDonutSlicePath(slice.startAngle, slice.endAngle, 50, 50, 46, 22);
                          return (
                            <path
                              key={idx}
                              d={pathD}
                              fill={slice.color}
                              className="lens-donut-slice"
                              style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                            >
                              <title>{slice.name}: {slice.count}</title>
                            </path>
                          );
                        })}
                      </svg>
                    </div>
                    <div className="flex-grow-1 min-w-0" style={{ fontSize: '0.68rem', lineHeight: '1.4' }}>
                      {donutSlices.map((slice, idx) => (
                        <div key={idx} className="d-flex align-items-start gap-1.5 mb-1">
                          <span 
                            style={{ 
                              width: '7px', 
                              height: '7px', 
                              borderRadius: '50%', 
                              backgroundColor: slice.color, 
                              display: 'inline-block',
                              flexShrink: 0,
                              marginTop: '4px'
                            }} 
                          />
                          <span className="font-medium text-main" title={slice.name}>
                            {slice.name}
                          </span>
                          <span className="text-muted ms-auto" style={{ paddingLeft: '8px', flexShrink: 0 }}>({slice.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </Col>
          )}
        </Row>
      </Container>
      </div>{/* /lens-main-content */}
      </div>{/* /lens-layout-wrapper */}

      {/* ==================== 6. MODALS ==================== */}
      {/* 6.1 Save Query Modal */}
      <Modal
        show={showSaveQueryModal}
        onHide={() => setShowSaveQueryModal(false)}
        centered
        className="lens-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('saveQueryTitle')}</Modal.Title>
          <button className="lens-modal-close-btn" onClick={() => setShowSaveQueryModal(false)}>×</button>
        </Modal.Header>
        <Form onSubmit={handleSaveQuery}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="saveQueryTitleInput">
              <Form.Label>{t('queryTitleLabel')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('queryTitleLabel')}
                value={queryTitle}
                onChange={(e) => setQueryTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="saveQueryDescInput">
              <Form.Label>{t('queryDescLabel')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('queryDescLabel')}
                value={queryDesc}
                onChange={(e) => setQueryDesc(e.target.value)}
              />
            </Form.Group>

            <div className="lens-modal-panel-title">
              {t('notificationsLabel')}
              <Icon icon="lucide:info" className="info-icon" width="14" />
            </div>
            <div className="lens-modal-panel-box">
              <Form.Check
                type="checkbox"
                id="notify-alert"
                label={t('notificationsLabel')}
                checked={queryNotify}
                onChange={(e) => setQueryNotify(e.target.checked)}
                className="mb-2 text-xs"
              />
              <Form.Check
                type="checkbox"
                id="email-alerts"
                label={t('emailAlertsLabel')}
                checked={queryEmailAlerts}
                onChange={(e) => setQueryEmailAlerts(e.target.checked)}
                className="text-xs"
              />
            </div>

            <div className="lens-modal-panel-title">
              {t('whoHasAccessLabel')}
            </div>
            <div className="lens-modal-panel-box">
              <Form.Check
                type="radio"
                name="queryAccess"
                id="access-restricted"
                label={t('restrictedAccessLabel')}
                checked={queryAccess === 'restricted'}
                onChange={() => setQueryAccess('restricted')}
                className="mb-2 text-xs"
              />
              <Form.Check
                type="radio"
                name="queryAccess"
                id="access-public"
                label={t('publicAccessLabel')}
                checked={queryAccess === 'public'}
                onChange={() => setQueryAccess('public')}
                className="text-xs"
              />
            </div>
          </Modal.Body>
          <div className="modal-footer border-top-0 d-flex justify-content-end gap-2 p-3 pt-0">
            <button
              type="button"
              className="lens-modal-btn-cancel"
              onClick={() => setShowSaveQueryModal(false)}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="lens-modal-btn-save">
              {t('save')}
            </button>
          </div>
        </Form>
      </Modal>

      {/* 6.2 Share Modal */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        className="lens-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('shareTitle')}</Modal.Title>
          <button className="lens-modal-close-btn" onClick={() => setShowShareModal(false)}>×</button>
        </Modal.Header>
        <Modal.Body>
          <div className="share-social-grid">
            <button
              className="share-social-btn twitter"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Icon icon="ri:twitter-x-fill" width="16" />
              {t('shareTwitter')}
            </button>
            <button
              className="share-social-btn linkedin"
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Icon icon="ri:linkedin-box-fill" width="16" />
              {t('shareLinkedIn')}
            </button>
            <button
              className="share-social-btn facebook"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Icon icon="ri:facebook-box-fill" width="16" />
              {t('shareFacebook')}
            </button>
            <button
              className="share-social-btn email"
              onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`; }}
            >
              <Icon icon="ri:mail-fill" width="16" />
              {t('shareEmail')}
            </button>
          </div>

          <div className="lens-modal-panel-title mb-2">
            {t('copyLinkToShare')}
          </div>
          <div className="share-copy-group">
            <Form.Control
              type="text"
              readOnly
              value={window.location.href}
              className="share-copy-input"
            />
            <button
              type="button"
              className="share-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success(t('linkCopied'));
              }}
              title="Copy Link"
            >
              <Icon icon="lucide:copy" width="16" />
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* 6.3 Export Modal */}
      <Modal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        centered
        size="lg"
        className="lens-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('export')}</Modal.Title>
          <button className="lens-modal-close-btn" onClick={() => setShowExportModal(false)}>×</button>
        </Modal.Header>
        <Form onSubmit={handleExportSubmit}>
          <Modal.Body>
            <div className="export-split-layout">
              {/* Left pane: export settings */}
              <div className="export-left-pane">
                <Form.Group className="mb-2" controlId="exportDocCountInput">
                  <Form.Label>{t('docsToInclude')}</Form.Label>
                  <Form.Select
                    value={exportDocCount}
                    onChange={(e) => setExportDocCount(Number(e.target.value))}
                    className="form-control"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1,000</option>
                    <option value={5000}>5,000</option>
                  </Form.Select>
                  <span className="text-muted d-block mt-1 mb-2" style={{ fontSize: '0.68rem' }}>
                    {t('fileDownloadedInBrowser')}{' '}
                    <a href="https://www.lens.org/about/attribution" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                      {t('attributionPolicyLink')}
                    </a>
                  </span>
                </Form.Group>

                <Form.Group className="mb-2" controlId="exportFormatInput">
                  <Form.Label>{t('exportFileFormat')}</Form.Label>
                  <Form.Select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="form-control"
                  >
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                  </Form.Select>
                  <span className="text-muted d-block mt-1 mb-2" style={{ fontSize: '0.68rem' }}>
                    {t('selectJsonLines')}
                  </span>
                </Form.Group>

                <div className="export-fields-header">
                  <span className="form-label mb-0">{t('exportFieldsLabel')}</span>
                  <div className="export-fields-icons">
                    <button
                      type="button"
                      className="export-fields-icon-btn text-success"
                      onClick={() => setExportFields({
                        title: true, authors: true, journal: true, doi: true,
                        issn: true, keywords: true, citations: true, year: true
                      })}
                      title={t('selectAll', 'Select All')}
                    >
                      <Icon icon="lucide:check-circle-2" width="16" />
                    </button>
                    <button
                      type="button"
                      className="export-fields-icon-btn text-danger"
                      onClick={() => setExportFields({
                        title: false, authors: false, journal: false, doi: false,
                        issn: false, keywords: false, citations: false, year: false
                      })}
                      title={t('deselectAll', 'Deselect All')}
                    >
                      <Icon icon="lucide:minus-circle" width="16" />
                    </button>
                  </div>
                </div>

                <div className="export-fields-grid">
                  <Form.Check
                    type="checkbox"
                    id="field-title"
                    label={t('colArticle')}
                    checked={exportFields.title}
                    onChange={(e) => setExportFields(prev => ({ ...prev, title: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-authors"
                    label={t('colAuthors')}
                    checked={exportFields.authors}
                    onChange={(e) => setExportFields(prev => ({ ...prev, authors: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-journal"
                    label={t('colJournal')}
                    checked={exportFields.journal}
                    onChange={(e) => setExportFields(prev => ({ ...prev, journal: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-doi"
                    label={t('colDoi')}
                    checked={exportFields.doi}
                    onChange={(e) => setExportFields(prev => ({ ...prev, doi: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-issn"
                    label={t('colIssn')}
                    checked={exportFields.issn}
                    onChange={(e) => setExportFields(prev => ({ ...prev, issn: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-keywords"
                    label={t('colKeywords')}
                    checked={exportFields.keywords}
                    onChange={(e) => setExportFields(prev => ({ ...prev, keywords: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-citations"
                    label={t('citedByLabel')}
                    checked={exportFields.citations}
                    onChange={(e) => setExportFields(prev => ({ ...prev, citations: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-year"
                    label={t('yearLabel')}
                    checked={exportFields.year}
                    onChange={(e) => setExportFields(prev => ({ ...prev, year: e.target.checked }))}
                    className="export-field-check"
                  />
                </div>

                <Form.Group className="mt-2" controlId="exportFileNameInput">
                  <Form.Label>{t('exportFileNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder="articles-export"
                  />
                </Form.Group>
              </div>

              {/* Right pane: Lens Info & Attribution badge */}
              <div className="export-right-pane">
                <h6>{t('usingDataText')}</h6>
                <p>{t('usingDataDesc')}</p>
                <div className="btn-enabled-lens">
                  <Icon icon="lucide:check-circle" width="14" />
                  {t('enabledByLens')}
                </div>
                <div className="attribution-code-box">
                  {`<iframe src="https://lens.org/lens/embed/attribution" scrolling="no" height="30px" width="100%"></iframe>`}
                </div>
                <a href="https://www.lens.org/about/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  {t('moreInfoTerms')}
                </a>
              </div>
            </div>
          </Modal.Body>
          <div className="modal-footer border-top-0 d-flex justify-content-end gap-2 p-3 pt-0">
            <button
              type="button"
              className="lens-modal-btn-cancel"
              onClick={() => setShowExportModal(false)}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="lens-modal-btn-save">
              {t('export')}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
