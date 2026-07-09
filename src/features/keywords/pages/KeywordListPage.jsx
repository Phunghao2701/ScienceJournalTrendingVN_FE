/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\pages\KeywordListPage.jsx
 */
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import KeywordSearchBar from '../components/KeywordSearchBar';
import KeywordSortDropdown from '../components/KeywordSortDropdown';
import KeywordList from '../components/KeywordList';
import { useKeywords } from '../hooks/useKeywords';
import './KeywordListPage.css';

/**
 * Trang danh sách Keywords.
 * Route: /keywords
 */
export default function KeywordListPage() {
  const navigate = useNavigate();
  const { keywords, pagination, loading, error, filters, actions } = useKeywords();

  const handleSearch = (q) => {
    actions.setKeyword(q);
  };

  const handleClearSearch = () => {
    actions.setKeyword('');
  };

  const handleSortChange = (sortBy, sortOrder) => {
    actions.setSort(sortBy, sortOrder);
  };

  const handlePageChange = (page) => {
    actions.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewArticles = (keywordId) => {
    navigate(`/keywords/${keywordId}/articles`);
  };

  return (
    <div className="grid-bg keyword-list-page d-flex flex-column">
      <Header />

      <Container className="pb-5 pt-4 flex-grow-1">
        <nav aria-label="breadcrumb" className="keyword-list-breadcrumb mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active text-main fw-semibold" aria-current="page">Keywords</li>
          </ol>
        </nav>

        <section className="keyword-list-hero">
          <div className="keyword-list-hero__content">
            <div className="keyword-list-eyebrow">
              <Icon icon="lucide:tags" width="18" />
              <span>Research Keywords</span>
            </div>
            <h1 className="keyword-list-title">
              Khám phá Keywords
            </h1>
            <p className="keyword-list-description">
              Tìm kiếm các từ khóa nghiên cứu và mở nhanh danh sách bài báo liên quan trong hệ thống ResearchPulse.
            </p>
            {pagination.total > 0 && (
              <div className="keyword-list-total-pill">
                <Icon icon="lucide:database" width="16" />
                <span>
                  Tổng cộng <strong>{pagination.total.toLocaleString()}</strong> keyword trong hệ thống
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="keyword-toolbar">
          <div className="keyword-toolbar__search">
            <KeywordSearchBar
              value={filters.keyword}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>
          <KeywordSortDropdown
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onChange={handleSortChange}
          />
        </div>

        {/* Active filter context */}
        {filters.keyword && (
          <div className="keyword-active-filter">
            <span>Kết quả tìm kiếm cho:</span>
            <span className="keyword-active-filter__term">
              "{filters.keyword}"
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm p-0 keyword-active-filter__clear"
              onClick={handleClearSearch}
            >
              <Icon icon="lucide:x" width="14" className="me-1" />
              Xóa
            </button>
          </div>
        )}

        {/* Keyword grid */}
        <KeywordList
          keywords={keywords}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewArticles={handleViewArticles}
          onRetry={actions.refetch}
        />
      </Container>
    </div>
  );
}
