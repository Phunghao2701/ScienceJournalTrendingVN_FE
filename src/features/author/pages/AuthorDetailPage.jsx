/**
 * @file AuthorDetailPage.jsx
 * @description Trang chi tiết hiển thị hồ sơ học thuật cao cấp của tác giả, phong cách Lens.org.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Nav, Collapse, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import useAuth from '../../auth/hooks/useAuth';
import { bookmarkArticleApi } from '../../article/api/articleApi';
import { toast } from '../../../shared/utils/toast';
import './AuthorDetailPage.css';

// Formats large axis values compactly (e.g. 12141930 -> "12.1M") so long numbers
// never overflow the chart's fixed padding and get clipped by the card border.
function formatCompactAxisNumber(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toLocaleString();
}

// SVG Bar Chart Component for Scholarly Works & Citations Over Time
function AuthorWorksChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-muted-custom" style={{ minHeight: '180px' }}>
        <Icon icon="lucide:bar-chart-2" width="24" className="me-2" />
        <span>Không có dữ liệu lịch sử công bố</span>
      </div>
    );
  }

  const W = 380;
  const H = 180;
  const PAD = { top: 20, right: 30, bottom: 25, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const works = data.map((d) => d.works);
  const citations = data.map((d) => d.citations);

  const maxWorks = Math.max(5, ...works);
  const maxCitations = Math.max(5, ...citations);

  const barW = Math.max(10, (chartW / data.length) * 0.45);
  const gap = (chartW - barW * data.length) / (data.length - 1 || 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + (1 - t) * chartH;
        return (
          <line
            key={t}
            x1={PAD.left}
            x2={PAD.left + chartW}
            y1={y}
            y2={y}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        );
      })}

      {/* Bars (Scholarly Works) */}
      {data.map((d, i) => {
        const x = PAD.left + i * (barW + gap) + gap * 0.5;
        const val = d.works;
        const h = (val / maxWorks) * chartH;
        const y = PAD.top + chartH - h;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(1, h)}
              fill="rgba(14, 165, 233, 0.8)"
              rx="1.5"
              className="chart-bar"
              style={{ transition: 'all 0.3s' }}
            >
              <title>{`${d.year}: ${val} bài báo`}</title>
            </rect>
          </g>
        );
      })}

      {/* Line Chart (Citations) */}
      {(() => {
        const pts = data.map((d, i) => {
          const x = PAD.left + i * (barW + gap) + gap * 0.5 + barW * 0.5;
          const y = PAD.top + chartH - (d.citations / maxCitations) * chartH;
          return `${x},${y}`;
        }).join(' ');

        return (
          <g>
            <polyline
              points={pts}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((d, i) => {
              const cx = PAD.left + i * (barW + gap) + gap * 0.5 + barW * 0.5;
              const cy = PAD.top + chartH - (d.citations / maxCitations) * chartH;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill="#f59e0b"
                  stroke="var(--bg-card)"
                  strokeWidth="1.2"
                >
                  <title>{`${d.year}: ${d.citations} trích dẫn`}</title>
                </circle>
              );
            })}
          </g>
        );
      })()}

      {/* X Axis Labels (thinned out so long histories don't overlap) */}
      {(() => {
        const maxLabels = Math.max(1, Math.floor(chartW / 28));
        const labelStep = Math.max(1, Math.ceil(data.length / maxLabels));
        const lastIndex = data.length - 1;
        const indices = [];
        for (let i = 0; i < data.length; i += labelStep) indices.push(i);
        if (indices[indices.length - 1] !== lastIndex) {
          // Drop the closest stepped label if it would crowd the forced last one.
          if (lastIndex - indices[indices.length - 1] < labelStep) indices.pop();
          indices.push(lastIndex);
        }
        return indices.map((i) => {
          const d = data[i];
          const x = PAD.left + i * (barW + gap) + gap * 0.5 + barW * 0.5;
          return (
            <text
              key={i}
              x={x}
              y={H - 6}
              textAnchor="middle"
              style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter' }}
            >
              {d.year}
            </text>
          );
        });
      })()}

      {/* Y Axis Left Labels (Works) */}
      <text x={PAD.left - 5} y={PAD.top + 3} textAnchor="end" style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter' }}>
        {formatCompactAxisNumber(maxWorks)}
      </text>
      <text x={PAD.left - 5} y={PAD.top + chartH + 3} textAnchor="end" style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter' }}>
        0
      </text>

      {/* Y Axis Right Labels (Citations) */}
      <text x={PAD.left + chartW + 5} y={PAD.top + 3} textAnchor="start" style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter' }}>
        {formatCompactAxisNumber(maxCitations)}
      </text>
      <text x={PAD.left + chartW + 5} y={PAD.top + chartH + 3} textAnchor="start" style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter' }}>
        0
      </text>
    </svg>
  );
}

export default function AuthorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;

  const {
    currentAuthor,
    authorArticles,
    authorBreakdown,
    loadingAuthorDetail,
    loadingArticles,
    loadingAreas,
    fetchAuthorDetailsFull,
  } = useAuthors();

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('works');
  const [sortKey, setSortKey] = useState('year-desc');
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});

  useEffect(() => {
    if (id) {
      fetchAuthorDetailsFull(id);
    }
  }, [id, fetchAuthorDetailsFull]);

  // Load bookmarks state
  useEffect(() => {
    if (authorArticles?.length > 0) {
      const map = {};
      authorArticles.forEach((art) => {
        const artId = art.article_id || art.id;
        const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${artId}`;
        map[artId] = localStorage.getItem(localBookmarkKey) === 'true';
      });
      setBookmarkedMap(map);
    }
  }, [authorArticles, currentUser]);

  const authorName = currentAuthor?.full_name ?? currentAuthor?.display_name ?? currentAuthor?.name ?? 'Tác giả';
  const primaryAffiliation = currentAuthor?.institution_1 ?? currentAuthor?.last_known_institution ?? 'Đang cập nhật đơn vị';

  // Toggle follow status
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`Đang theo dõi tác giả ${authorName}`);
    } else {
      toast.info(`Đã bỏ theo dõi tác giả ${authorName}`);
    }
  };

  // Toggle abstract preview
  const toggleAbstract = (articleId) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // Bookmark Toggle logic
  const handleBookmarkToggle = async (articleId) => {
    const isBookmarked = bookmarkedMap[articleId];
    const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${articleId}`;
    const nextState = !isBookmarked;

    try {
      await bookmarkArticleApi(articleId);
      setBookmarkedMap((prev) => ({ ...prev, [articleId]: nextState }));
      localStorage.setItem(localBookmarkKey, String(nextState));
      toast.success(nextState ? 'Đã thêm bài báo vào project.' : 'Đã xóa bài báo khỏi project.');
    } catch (err) {
      console.warn('Bookmark API error, toggling state locally:', err);
      setBookmarkedMap((prev) => ({ ...prev, [articleId]: nextState }));
      localStorage.setItem(localBookmarkKey, String(nextState));
      toast.warning('Không thể đồng bộ server, đã cập nhật tạm trên trình duyệt.');
    }
  };

  // Process years data for SVG Chart
  const yearsData = useMemo(() => {
    if (!authorArticles || authorArticles.length === 0) return [];

    const counts = {};
    const cits = {};
    authorArticles.forEach((art) => {
      const y = art.publication_year || art.year;
      if (y) {
        counts[y] = (counts[y] || 0) + 1;
        const citCount = art.citation_count ?? art.cited_by_count ?? art.citations ?? 0;
        cits[y] = (cits[y] || 0) + citCount;
      }
    });

    const years = Object.keys(counts).map(Number);
    if (years.length === 0) return [];

    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const data = [];
    // Pad years so chart is not empty/too thin
    const startYear = Math.min(minYear, new Date().getFullYear() - 4);
    const endYear = Math.max(maxYear, new Date().getFullYear());

    for (let y = startYear; y <= endYear; y++) {
      data.push({
        year: y,
        works: counts[y] || 0,
        citations: cits[y] || 0,
      });
    }
    return data;
  }, [authorArticles]);

  // Extract Co-authors dynamically from article co-author fields
  const coauthors = useMemo(() => {
    const allCoauthors = {};
    authorArticles.forEach((art) => {
      if (Array.isArray(art.authors)) {
        art.authors.forEach((au) => {
          const auName = au.display_name || au.name || au.author_name;
          const auId = au.author_id || au.id;
          if (auName && auName !== currentAuthor?.full_name && auName !== currentAuthor?.name) {
            allCoauthors[auName] = {
              id: auId,
              name: auName,
              count: (allCoauthors[auName]?.count || 0) + 1,
              institution: au.last_known_institution || au.institution || 'Đơn vị nghiên cứu'
            };
          }
        });
      }
    });
    return Object.values(allCoauthors).sort((a, b) => b.count - a.count);
  }, [authorArticles, currentAuthor]);

  // Sorting publications
  const sortedArticles = useMemo(() => {
    const list = [...authorArticles];
    if (sortKey === 'year-desc') {
      return list.sort((a, b) => (b.publication_year || b.year || 0) - (a.publication_year || a.year || 0));
    }
    if (sortKey === 'year-asc') {
      return list.sort((a, b) => (a.publication_year || a.year || 0) - (b.publication_year || b.year || 0));
    }
    if (sortKey === 'citations-desc') {
      return list.sort((a, b) => {
        const cB = b.citation_count ?? b.cited_by_count ?? b.citations ?? 0;
        const cA = a.citation_count ?? a.cited_by_count ?? a.citations ?? 0;
        return cB - cA;
      });
    }
    return list;
  }, [authorArticles, sortKey]);

  return (
    <div className="author-detail-page">
      <Header />

      <Container fluid className="position-relative z-1 px-3 px-xl-5 pt-4">
        {/* BREADCRUMB */}
        <div className="lens-breadcrumb mb-4">
          <span className="lens-breadcrumb-link" onClick={() => navigate('/')}>Tổng quan</span>
          <Icon icon="lucide:chevron-right" width="12" />
          <span className="lens-breadcrumb-link" onClick={() => navigate('/authors')}>Tác giả nổi bật</span>
          <Icon icon="lucide:chevron-right" width="12" />
          <span className="lens-breadcrumb-current">{authorName}</span>
        </div>

        {loadingAuthorDetail ? (
          <div className="lens-author-profile-header-card p-4 mb-4 text-center">
            <div className="skeleton-shimmer rounded-circle mx-auto mb-3" style={{ width: '80px', height: '80px' }} />
            <div className="skeleton-shimmer rounded mx-auto mb-2" style={{ width: '200px', height: '24px' }} />
            <div className="skeleton-shimmer rounded mx-auto" style={{ width: '350px', height: '16px' }} />
          </div>
        ) : (
          <>
            {/* HERO PROFILE HEADER */}
            <div className="lens-author-profile-header-card p-4 mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                {/* Profile Details */}
                <div className="d-flex align-items-center gap-3">
                  <div className="lens-author-avatar-circle flex-shrink-0">
                    {authorName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                      <h2 className="lens-author-name mb-0 text-truncate">{authorName}</h2>
                      <span className="lens-badge-author-role">AUTHOR</span>
                    </div>
                    <p className="lens-author-affiliation text-muted-custom mb-3">
                      <Icon icon="lucide:building" className="me-1" />
                      {primaryAffiliation}
                    </p>
                    <Button
                      variant={isFollowing ? "outline-secondary" : "primary"}
                      onClick={handleFollowToggle}
                      className="lens-author-follow-btn"
                      size="sm"
                    >
                      {isFollowing ? (
                        <>
                          <Icon icon="lucide:check" className="me-1" />
                          Following
                        </>
                      ) : (
                        '+ Follow'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Overall statistics */}
                <div className="d-flex align-items-center gap-4">
                  <div className="lens-stat-box-large">
                    <Icon icon="lucide:file-text" className="stat-icon-blue" />
                    <div>
                      <div className="stat-value">
                        {currentAuthor?.article_count ?? authorArticles.length}
                      </div>
                      <div className="stat-label">Scholarly Works</div>
                    </div>
                  </div>
                  <div className="lens-stat-box-large">
                    <Icon icon="lucide:quote" className="stat-icon-orange" />
                    <div>
                      <div className="stat-value">
                        {(currentAuthor?.citation_count ?? currentAuthor?.citations ?? 0).toLocaleString()}
                      </div>
                      <div className="stat-label">Citations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE COLUMN DETAILS ROW */}
            <Row className="g-4 mb-4">
              {/* Box 1: Summary Stats */}
              <Col xs={12} lg={4}>
                <Card className="lens-detail-card h-100">
                  <Card.Header className="lens-detail-card-header">
                    <Icon icon="lucide:info" width="16" />
                    <span>Summary Stats</span>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <div className="d-flex flex-column gap-3 font-sans text-xs">
                      <div>
                        <div className="text-muted-custom fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem' }}>Author Profiles</div>
                        <div className="d-flex align-items-center gap-1">
                          <Icon icon="lucide:external-link" width="12" className="text-primary" />
                          <span className="text-dark fw-semibold">1 Profile Link</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-custom fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem' }}>ORCID</div>
                        <div className="font-monospace text-dark text-truncate">
                          {currentAuthor?.orcid || 'Chưa cập nhật ORCID'}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-custom fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem' }}>Primary Institution</div>
                        <div className="text-dark fw-semibold text-truncate">
                          {primaryAffiliation}
                        </div>
                      </div>

                      {currentAuthor?.email && (
                        <div>
                          <div className="text-muted-custom fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem' }}>Contact Email</div>
                          <div className="text-primary text-truncate">{currentAuthor.email}</div>
                        </div>
                      )}

                      {currentAuthor?.homepage && (
                        <div>
                          <div className="text-muted-custom fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem' }}>Homepage</div>
                          <a
                            href={currentAuthor.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-truncate text-decoration-none d-block"
                          >
                            {currentAuthor.homepage}
                          </a>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Box 2: Works Over Time SVG Chart */}
              <Col xs={12} lg={4}>
                <Card className="lens-detail-card h-100">
                  <Card.Header className="lens-detail-card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Icon icon="lucide:bar-chart-2" width="16" />
                      <span>Scholarly Works Over Time</span>
                    </div>
                    {/* Mini legends */}
                    <div className="d-flex gap-2" style={{ fontSize: '0.62rem' }}>
                      <div className="d-flex align-items-center gap-1 text-muted-custom">
                        <div style={{ width: 8, height: 8, backgroundColor: 'rgba(14, 165, 233, 0.85)', borderRadius: '1.5px' }} />
                        <span>Works</span>
                      </div>
                      <div className="d-flex align-items-center gap-1 text-muted-custom">
                        <div style={{ width: 8, height: 1.5, backgroundColor: '#f59e0b' }} />
                        <span>Citations</span>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-2 d-flex flex-column justify-content-center h-100">
                    <AuthorWorksChart data={yearsData} />
                  </Card.Body>
                </Card>
              </Col>

              {/* Box 3: Subject Areas/Fields of Study */}
              <Col xs={12} lg={4}>
                <Card className="lens-detail-card h-100">
                  <Card.Header className="lens-detail-card-header">
                    <Icon icon="lucide:tags" width="16" />
                    <span>Research Fields & Breakdown</span>
                  </Card.Header>
                  <Card.Body className="p-3">
                    {loadingAreas ? (
                      <div className="skeleton-shimmer rounded w-100 h-100" style={{ minHeight: '120px' }} />
                    ) : authorBreakdown && authorBreakdown.length > 0 ? (
                      <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {authorBreakdown.slice(0, 4).map((item, index) => {
                          const name = item.subject_area || item.display_name || item.name || 'Chưa phân loại';
                          const pct = item.percentage ?? 0;
                          return (
                            <div key={index} className="text-xs">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-dark fw-semibold text-truncate me-2" style={{ maxWidth: '80%' }}>
                                  {name}
                                </span>
                                <span className="text-muted-custom">{pct}%</span>
                              </div>
                              <div className="progress" style={{ height: '4px', backgroundColor: 'var(--bg-main)' }}>
                                <div
                                  className="progress-bar bg-info"
                                  role="progressbar"
                                  style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }}
                                  aria-valuenow={pct}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : currentAuthor?.subject_areas && currentAuthor.subject_areas.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {currentAuthor.subject_areas.map((tag, idx) => (
                          <span
                            key={idx}
                            className="badge text-dark font-sans px-2.5 py-1.5 border"
                            style={{
                              backgroundColor: 'var(--bg-main)',
                              borderColor: 'var(--border)',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 500,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted-custom font-sans text-xs">
                        Chưa có dữ liệu lĩnh vực nghiên cứu.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* TAB SECTION WITH SCHOLARLY WORKS */}
            <Card className="lens-detail-card mb-5">
              <Card.Header className="lens-detail-card-tabs-header p-0">
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="works" className="lens-nav-link">
                      Scholarly Works ({(authorArticles || []).length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="patents" className="lens-nav-link">
                      Citing Patents (0)
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="coauthors" className="lens-nav-link">
                      Co-authors ({coauthors.length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="collections" className="lens-nav-link">
                      Collections
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body className="p-3">
                {activeTab === 'works' && (
                  <div>
                    {/* Toolbar / Sorting */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-xs text-muted-custom font-sans">
                        Hiển thị <strong>{sortedArticles.length}</strong> bài báo khoa học.
                      </span>

                      <div className="d-flex align-items-center gap-2">
                        <span className="text-xs text-muted-custom" style={{ whiteSpace: 'nowrap' }}>Sắp xếp:</span>
                        <Form.Select
                          size="sm"
                          value={sortKey}
                          onChange={(e) => setSortKey(e.target.value)}
                          className="lens-author-sort-select"
                        >
                          <option value="year-desc">Năm (Mới nhất)</option>
                          <option value="year-asc">Năm (Cũ nhất)</option>
                          <option value="citations-desc">Số trích dẫn</option>
                        </Form.Select>
                      </div>
                    </div>

                    {loadingArticles ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                        <span className="text-xs text-muted-custom">Đang tải danh sách bài báo...</span>
                      </div>
                    ) : sortedArticles.length === 0 ? (
                      <div className="text-center py-5 text-muted-custom font-sans text-xs">
                        Tác giả này chưa có bài báo nào được lưu trữ trong hệ thống.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {sortedArticles.map((article, idx) => {
                          const artId = article.article_id || article.id;
                          const title = article.title || 'Untitled Article';
                          const journal = article.journal_name || article.journal || 'Tạp chí khoa học';
                          const year = article.publication_year || article.year || '—';
                          const cites = article.citation_count ?? article.cited_by_count ?? article.citations ?? 0;
                          const doi = article.doi || '';
                          const isBookmarked = bookmarkedMap[artId];
                          const isOpenAccess = article.is_open_access ?? true;
                          const isExpanded = expandedAbstracts[artId];

                          return (
                            <div key={artId || idx} className="lens-article-card-item">
                              <div className="d-flex align-items-start gap-1">
                                {/* Checkbox / Index */}
                                <div className="d-flex flex-column align-items-center gap-1" style={{ minWidth: '22px' }}>
                                  <Form.Check type="checkbox" className="lens-checkbox-sm" />
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    {idx + 1}
                                  </span>
                                </div>

                                {/* Content Details */}
                                <div className="flex-grow-1 min-w-0">
                                  {/* Title (blue link) */}
                                  <h4
                                    onClick={() => navigate(`/articles/${artId}`)}
                                    className="lens-article-card-title mb-1"
                                  >
                                    {title}
                                  </h4>

                                  {/* Badges line */}
                                  <div className="d-flex gap-2 flex-wrap mb-2">
                                    <span className="lens-ext-badge text-uppercase gray text-2xs">
                                      <Icon icon="lucide:file-text" className="me-1 text-dark" />
                                      Journal Article
                                    </span>
                                    <span className={`lens-ext-badge text-uppercase text-2xs ${isOpenAccess ? 'open' : 'restricted'}`}>
                                      <Icon icon={isOpenAccess ? 'lucide:lock-keyhole-open' : 'lucide:lock-keyhole'} className="me-1" />
                                      {isOpenAccess ? 'Open Access' : 'Restricted Access'}
                                    </span>
                                  </div>

                                  {/* Info details */}
                                  <div className="lens-article-card-detail-line text-xs font-sans">
                                    <strong>Journal:</strong>{' '}
                                    <span className="text-dark fw-semibold">{journal}</span>
                                    {article.volume_number && `, Vol: ${article.volume_number}`}
                                    {article.issue_number && `, Issue: ${article.issue_number}`}
                                    {`, Published: ${year}`}
                                  </div>

                                  {/* Authors details */}
                                  {article.authors && (
                                    <div className="lens-article-card-detail-line text-xs font-sans">
                                      <strong>Authors:</strong>{' '}
                                      <span className="text-muted-custom">
                                        {Array.isArray(article.authors)
                                          ? article.authors.map((a) => a.display_name || a.name || 'Tác giả').join(', ')
                                          : article.authors_text || article.authors || 'Đang cập nhật'}
                                      </span>
                                    </div>
                                  )}

                                  {/* Citation metrics */}
                                  <div className="lens-article-card-detail-line text-xs font-sans">
                                    Citing Patents: <strong>0</strong> | Citing Scholarly Works:{' '}
                                    <span className="text-primary fw-bold">{cites}</span> | Reference Count:{' '}
                                    <strong>{article.reference_count ?? 19}</strong>
                                    {doi && (
                                      <>
                                        {' | '}
                                        <strong>DOI:</strong>{' '}
                                        <span className="font-monospace text-xs text-dark">{doi}</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Action links */}
                                  <div className="d-flex align-items-center gap-3 mt-2">
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="lens-article-card-action-btn p-0"
                                      onClick={() => toggleAbstract(artId)}
                                    >
                                      <Icon icon="lucide:text" className="me-1" />
                                      {isExpanded ? 'Collapse Abstract' : 'Abstract'}
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className={`lens-article-card-action-btn p-0 ${isBookmarked ? 'active' : ''}`}
                                      onClick={() => handleBookmarkToggle(artId)}
                                    >
                                      <Icon icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark-plus'} className="me-1" />
                                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="lens-article-card-action-btn p-0"
                                      onClick={() => {
                                        navigator.clipboard.writeText(window.location.origin + `/articles/${artId}`);
                                        toast.success('Đã sao chép liên kết bài báo.');
                                      }}
                                    >
                                      <Icon icon="lucide:share" className="me-1" />
                                      Share
                                    </Button>
                                  </div>

                                  {/* Collapsed Abstract section */}
                                  <Collapse in={isExpanded}>
                                    <div className="mt-2 p-3 bg-light rounded text-xs text-muted-custom font-sans" style={{ borderLeft: '3px solid var(--primary)', lineHeight: '1.6' }}>
                                      {article.abstract || 'Không có bản tóm tắt nội dung (abstract) chi tiết cho bài báo này trong cơ sở dữ liệu.'}
                                    </div>
                                  </Collapse>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'patents' && (
                  <div className="text-center py-5 text-muted-custom font-sans text-xs">
                    <Icon icon="lucide:award" width="36" className="text-muted mb-2" />
                    <p className="mb-0">Tác giả này chưa có công trình sáng chế (Patents) nào được trích dẫn trong hệ thống.</p>
                  </div>
                )}

                {activeTab === 'coauthors' && (
                  <div>
                    {coauthors.length === 0 ? (
                      <div className="text-center py-5 text-muted-custom font-sans text-xs">
                        Không tìm thấy đồng tác giả (Co-authors) nào liên kết trong hệ thống.
                      </div>
                    ) : (
                      <div className="row g-3">
                        {coauthors.map((co, idx) => (
                          <div key={idx} className="col-12 col-md-6 col-lg-4">
                            <Card
                              className="lens-coauthor-card p-3 h-100 cursor-pointer text-primary-hover border-light-custom"
                              onClick={() => co.id && navigate(`/authors/${co.id}`)}
                              style={{ borderColor: 'var(--border)' }}
                            >
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="lens-author-avatar-circle small">
                                  {co.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <h6 className="mb-0 text-truncate text-dark fw-bold text-xs">{co.name}</h6>
                                  <span className="text-2xs text-muted-custom text-truncate d-block">
                                    {co.institution}
                                  </span>
                                </div>
                              </div>
                              <div className="text-2xs text-muted-custom mt-auto">
                                <strong>{co.count}</strong> bài viết chung
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'collections' && (
                  <div className="text-center py-5 text-muted-custom font-sans text-xs">
                    <Icon icon="lucide:folder" width="36" className="text-muted mb-2" />
                    <p className="mb-0">Bộ sưu tập cá nhân (Collections) của tác giả này hiện chưa được công khai.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}
