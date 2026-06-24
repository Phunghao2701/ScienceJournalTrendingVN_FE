/**
 * File: src/features/trendingVN/components/articles/TrendingArticleTable.jsx
 *
 * Bảng danh sách bài báo xu hướng với các tính năng:
 * - Hiển thị metadata: tiêu đề, tác giả, năm xuất bản, tạp chí, DOI
 * - Sort theo cột (title, publication_year)
 * - Phân trang với ellipsis
 * - Skeleton loading và empty state
 *
 * Dữ liệu từ: GET /api/v1/articles
 * Fields dùng: article_id, title, authors, publication_year, journal_name, doi
 */

import { Pagination } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';
import './TrendingArticleTable.css';

// ─── Hàm format danh sách tác giả ────────────────────────────────────────────
function formatAuthors(authors) {
  if (!authors) return '';
  if (!Array.isArray(authors)) return String(authors);
  const base = authors.slice(0, 3).join(', ');
  if (authors.length > 3) {
    return base + ' +' + String(authors.length - 3);
  }
  return base;
}

// ─── Icon sort trên header cột ────────────────────────────────────────────────
function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) {
    return (
      <Icon
        icon="lucide:chevrons-up-down"
        style={{ fontSize: '0.75rem', opacity: 0.35, marginLeft: 3 }}
      />
    );
  }
  if (sortOrder === 'asc') {
    return (
      <Icon
        icon="lucide:chevron-up"
        style={{ fontSize: '0.75rem', color: 'var(--t-primary)', marginLeft: 3 }}
      />
    );
  }
  return (
    <Icon
      icon="lucide:chevron-down"
      style={{ fontSize: '0.75rem', color: 'var(--t-primary)', marginLeft: 3 }}
    />
  );
}

// ─── Component một dòng bài báo ───────────────────────────────────────────────
function ArticleRow({ article, index, currentPage, limit }) {
  const stt = (currentPage - 1) * limit + index + 1;
  const authorsText = formatAuthors(article.authors);
  const doiHref = 'https://doi.org/' + String(article.doi);

  let yearCell;
  if (article.publication_year) {
    yearCell = (
      <span className="tat-year-badge">{article.publication_year}</span>
    );
  } else {
    yearCell = <span className="tat-doi-empty">—</span>;
  }

  let journalCell;
  if (article.journal_name) {
    journalCell = (
      <span className="tat-journal-badge" title={article.journal_name}>
        <Icon icon="lucide:book-open" style={{ fontSize: '0.65rem', flexShrink: 0 }} />
        {article.journal_name}
      </span>
    );
  } else {
    journalCell = <span className="tat-doi-empty">—</span>;
  }

  let doiCell;
  if (article.doi) {
    doiCell = (
      <a href={doiHref} target="_blank" rel="noopener noreferrer" className="tat-doi-link">
        <Icon icon="lucide:external-link" style={{ fontSize: '0.7rem' }} />
        DOI
      </a>
    );
  } else {
    doiCell = <span className="tat-doi-empty">—</span>;
  }

  let authorsCell = null;
  if (authorsText) {
    authorsCell = (
      <div className="tat-authors">
        <Icon icon="lucide:users" style={{ fontSize: '0.7rem', flexShrink: 0 }} />
        <span>{authorsText}</span>
      </div>
    );
  }

  return (
    <tr>
      <td><span className="tat-stt">{stt}</span></td>
      <td>
        <div className="tat-article-title">
          {article.title || 'Không có tiêu đề'}
        </div>
        {authorsCell}
      </td>
      <td>{yearCell}</td>
      <td>{journalCell}</td>
      <td>{doiCell}</td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendingArticleTable({
  articles = [],
  loading = false,
  error = null,
  pagination = { page: 1, limit: 10, total: 0, total_pages: 1 },
  currentPage = 1,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
  onPageChange,
}) {

  const handleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const buildPageNumbers = () => {
    const total = pagination.total_pages;
    const pages = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - currentPage) <= 1) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="tat-skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="tat-skeleton-row skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // ── Lỗi ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="d-flex align-items-center gap-2 p-3 m-3"
        style={{
          background: '#fff5f5',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#dc2626',
          fontSize: '0.85rem',
        }}
      >
        <Icon icon="lucide:alert-circle" />
        <span>{error}</span>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!articles.length) {
    return (
      <div className="tat-empty">
        <Icon icon="lucide:file-search" className="tat-empty-icon" />
        <p className="tat-empty-title">Không tìm thấy bài báo nào</p>
        <p className="tat-empty-sub">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    );
  }

  const pageNumbers = buildPageNumbers();
  const pageInfo = 'Trang ' + currentPage + ' / ' + pagination.total_pages;
  const totalInfo = pagination.total.toLocaleString('vi-VN') + ' bài báo';
  const titleThClass = sortBy === 'title' ? 'sortable active-sort' : 'sortable';
  const yearThClass = sortBy === 'publication_year' ? 'sortable active-sort' : 'sortable';

  return (
    <div>

      {/* ── Bảng dữ liệu ──────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table className="tat-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th className={titleThClass} onClick={() => handleSort('title')}>
                Bài báo
                <SortIcon field="title" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th className={yearThClass} onClick={() => handleSort('publication_year')} style={{ width: 90 }}>
                Năm
                <SortIcon field="publication_year" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th style={{ width: 160 }}>Tạp chí</th>
              <th style={{ width: 80 }}>DOI</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, i) => (
              <ArticleRow
                key={article.article_id ? String(article.article_id) : String(i)}
                article={article}
                index={i}
                currentPage={currentPage}
                limit={pagination.limit}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {pagination.total_pages > 1 && (
        <div className="tat-pagination-bar">
          <span className="tat-pagination-info">
            {pageInfo} · {totalInfo}
          </span>
          <Pagination size="sm" className="mb-0 tat-pagination">
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            />
            {pageNumbers.map((p, idx) => {
              if (p === '...') {
                return <Pagination.Ellipsis key={'e' + String(idx)} disabled />;
              }
              return (
                <Pagination.Item
                  key={String(p)}
                  active={p === currentPage}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              disabled={currentPage === pagination.total_pages}
              onClick={() => onPageChange(currentPage + 1)}
            />
          </Pagination>
        </div>
      )}

    </div>
  );
}